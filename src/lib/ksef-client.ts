/**
 * Klient sesji KSeF (API „online” MF): token API — challenge → InitToken (XML) → nagłówek SessionToken.
 * Wymaga środowiska Node (node:crypto — RSA-OAEP); nie używać w Edge bez zamiennika.
 *
 * Zmienne: KSEF_API_BASE_URL, KSEF_API_TOKEN, KSEF_CONTEXT_NIP;
 * opcjonalnie KSEF_PUBLIC_KEY_CERTIFICATES_URL (domyślnie wyprowadzane z hostu test/prod).
 */

import { constants, createPublicKey, publicEncrypt } from "node:crypto";

const ONLINE_PREFIX = "/online";

export type KsefClientConfig = {
  /** Np. https://ksef-test.mf.gov.pl/api (bez końcowego slasha) */
  apiBaseUrl: string;
  /** Token KSeF z MCU (sekret) */
  apiToken: string;
  /** NIP kontekstu dla AuthorisationChallenge (type onip) */
  contextNip: string;
  /** Nadpisanie GET .../api/v2/security/public-key-certificates */
  publicKeyCertificatesUrl?: string;
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
};

export class KsefClient {
  private readonly apiBaseUrl: string;
  private readonly apiToken: string;
  private readonly contextNip: string;
  private readonly publicKeyCertificatesUrl?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly maxAttempts: number;

  constructor(config: KsefClientConfig) {
    this.apiBaseUrl = normalizeBaseUrl(config.apiBaseUrl);
    this.apiToken = config.apiToken;
    this.contextNip = config.contextNip.trim();
    this.publicKeyCertificatesUrl = config.publicKeyCertificatesUrl;
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.maxAttempts = Math.max(1, config.maxAttempts ?? 3);
  }

  static fromEnv(): KsefClient {
    const apiBaseUrl = process.env.KSEF_API_BASE_URL;
    const apiToken = process.env.KSEF_API_TOKEN;
    const contextNip = process.env.KSEF_CONTEXT_NIP;
    if (!apiBaseUrl?.trim()) {
      throw new Error("Brak KSEF_API_BASE_URL w zmiennych środowiskowych.");
    }
    if (!apiToken?.trim()) {
      throw new Error("Brak KSEF_API_TOKEN w zmiennych środowiskowych.");
    }
    if (!contextNip?.trim()) {
      throw new Error("Brak KSEF_CONTEXT_NIP w zmiennych środowiskowych.");
    }
    return new KsefClient({
      apiBaseUrl,
      apiToken,
      contextNip,
      publicKeyCertificatesUrl:
        process.env.KSEF_PUBLIC_KEY_CERTIFICATES_URL?.trim() || undefined,
    });
  }

  /** POST /online/Session/AuthorisationChallenge */
  async authorisationChallenge(): Promise<AuthorisationChallengeResult> {
    const url = joinUrl(this.apiBaseUrl, `${ONLINE_PREFIX}/Session/AuthorisationChallenge`);
    const res = await this.fetchWithRetry(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contextIdentifier: { type: "onip", identifier: this.contextNip },
      }),
    });
    const json = (await readJsonBody(res)) as Record<string, unknown>;
    if (!res.ok) {
      throw ksefHttpError("AuthorisationChallenge", res, json);
    }
    const challenge = json.challenge;
    if (typeof challenge !== "string" || !challenge.length) {
      throw new Error("KSeF: brak pola challenge w odpowiedzi AuthorisationChallenge.");
    }
    const timestamp =
      typeof json.timestamp === "string"
        ? json.timestamp
        : typeof json.timestamp === "number"
          ? String(json.timestamp)
          : undefined;
    return { challenge, timestamp };
  }

  /** POST /online/Session/InitToken (application/octet-stream, XML InitSessionTokenRequest) */
  async initToken(challenge: string): Promise<string> {
    const certPem = await this.loadKsefTokenEncryptionCertificatePem();
    const encryptedTokenB64 = encryptKsefApiTokenForSession(this.apiToken, certPem);
    const xml = buildInitSessionTokenRequestXml(
      challenge,
      this.contextNip,
      encryptedTokenB64,
    );
    const url = joinUrl(this.apiBaseUrl, `${ONLINE_PREFIX}/Session/InitToken`);
    const res = await this.fetchWithRetry(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/octet-stream",
      },
      body: Buffer.from(xml, "utf8"),
    });
    const json = (await readJsonBody(res)) as Record<string, unknown>;
    if (!res.ok) {
      throw ksefHttpError("InitToken", res, json);
    }
    return extractSessionToken(json);
  }

  /** Cały flow: challenge → InitToken → sessionToken (jak w dokumentacji / sample-requests). */
  async obtainSessionToken(): Promise<string> {
    const { challenge } = await this.authorisationChallenge();
    return this.initToken(challenge);
  }

  /**
   * GET /online/Invoice/KSeF?ksefReferenceNumber=...
   * Uwierzytelnienie: nagłówek SessionToken (nie Bearer).
   */
  async fetchInvoiceKsef(
    ksefReferenceNumber: string,
    sessionToken: string,
  ): Promise<Response> {
    const q = new URLSearchParams({ ksefReferenceNumber });
    const url = joinUrl(
      this.apiBaseUrl,
      `${ONLINE_PREFIX}/Invoice/KSeF?${q.toString()}`,
    );
    return this.fetchWithRetry(url, {
      method: "GET",
      headers: {
        Accept: "application/xml, */*",
        SessionToken: sessionToken,
      },
    });
  }

  /** DELETE /online/Session/Terminate */
  async terminateSession(sessionToken: string): Promise<void> {
    const url = joinUrl(this.apiBaseUrl, `${ONLINE_PREFIX}/Session/Terminate`);
    const res = await this.fetchWithRetry(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        SessionToken: sessionToken,
      },
    });
    if (!res.ok && res.status !== 204) {
      const json = await readJsonBody(res);
      throw ksefHttpError("Session/Terminate", res, json);
    }
  }

  private async loadKsefTokenEncryptionCertificatePem(): Promise<string> {
    const certsUrl =
      this.publicKeyCertificatesUrl ?? derivePublicKeyCertificatesUrl(this.apiBaseUrl);
    const res = await this.fetchWithRetry(certsUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(
        `KSeF: nie udało się pobrać certyfikatów (${res.status}): ${t.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as unknown;
    const entry = pickCertificateByUsage(data, "KsefTokenEncryption");
    if (!entry?.certificate || typeof entry.certificate !== "string") {
      throw new Error("KSeF: brak certyfikatu KsefTokenEncryption w odpowiedzi API.");
    }
    return derBase64ToPem(entry.certificate);
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const res = await this.fetchImpl(url, init);
        if (res.status >= 500 && res.status < 600 && attempt < this.maxAttempts) {
          await sleep(200 * 2 ** (attempt - 1));
          continue;
        }
        return res;
      } catch (e) {
        lastErr = e;
        if (attempt < this.maxAttempts) {
          await sleep(200 * 2 ** (attempt - 1));
          continue;
        }
        throw e;
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error(String(lastErr));
  }
}

export type AuthorisationChallengeResult = {
  challenge: string;
  timestamp?: string;
};

function normalizeBaseUrl(base: string): string {
  return base.replace(/\/+$/, "");
}

function joinUrl(base: string, path: string): string {
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}

function derivePublicKeyCertificatesUrl(apiBaseUrl: string): string {
  let host: string;
  try {
    host = new URL(apiBaseUrl).hostname.toLowerCase();
  } catch {
    throw new Error("KSEF_API_BASE_URL ma nieprawidłowy format URL.");
  }
  if (host === "ksef-test.mf.gov.pl" || host.includes("ksef-test")) {
    return "https://api-test.ksef.mf.gov.pl/api/v2/security/public-key-certificates";
  }
  if (host === "ksef.mf.gov.pl" || (host.includes("ksef.mf.gov.pl") && !host.includes("test"))) {
    return "https://api.ksef.mf.gov.pl/api/v2/security/public-key-certificates";
  }
  if (host.startsWith("api-test.ksef.mf.gov.pl")) {
    return "https://api-test.ksef.mf.gov.pl/api/v2/security/public-key-certificates";
  }
  if (host.startsWith("api.ksef.mf.gov.pl")) {
    return "https://api.ksef.mf.gov.pl/api/v2/security/public-key-certificates";
  }
  throw new Error(
    "Ustaw KSEF_PUBLIC_KEY_CERTIFICATES_URL — nie rozpoznano środowiska po KSEF_API_BASE_URL.",
  );
}

type CertEntry = { certificate?: string; usage?: string[] };

function pickCertificateByUsage(
  data: unknown,
  usage: string,
): CertEntry | undefined {
  if (!Array.isArray(data)) return undefined;
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const u = (item as CertEntry).usage;
    if (Array.isArray(u) && u.includes(usage)) {
      return item as CertEntry;
    }
  }
  return undefined;
}

function derBase64ToPem(b64: string): string {
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN CERTIFICATE-----\n${lines}\n-----END CERTIFICATE-----`;
}

/** Format MF: `token|unix_ms` → RSA-OAEP SHA-256 → Base64 (zawartość elementu Token w XML). */
export function encryptKsefApiTokenForSession(
  apiToken: string,
  certificatePem: string,
): string {
  const payload = `${apiToken}|${Date.now()}`;
  const key = createPublicKey(certificatePem);
  const encrypted = publicEncrypt(
    {
      key,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(payload, "utf8"),
  );
  return encrypted.toString("base64");
}

function buildInitSessionTokenRequestXml(
  challenge: string,
  nip: string,
  encryptedTokenB64: string,
): string {
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<ns3:InitSessionTokenRequest xmlns="http://ksef.mf.gov.pl/schema/gtw/svc/online/types/2021/10/01/0001" ` +
    `xmlns:ns2="http://ksef.mf.gov.pl/schema/gtw/svc/types/2021/10/01/0001" ` +
    `xmlns:ns3="http://ksef.mf.gov.pl/schema/gtw/svc/online/auth/request/2021/10/01/0001">\n` +
    `  <ns3:Context>\n` +
    `    <Challenge>${escapeXml(challenge)}</Challenge>\n` +
    `    <Identifier xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns2:SubjectIdentifier">\n` +
    `      <ns2:Identifier>${escapeXml(nip)}</ns2:Identifier>\n` +
    `    </Identifier>\n` +
    `    <DocumentType>\n` +
    `      <ns2:Service>KSeF</ns2:Service>\n` +
    `      <ns2:FormCode>\n` +
    `        <ns2:SystemCode>FA (2)</ns2:SystemCode>\n` +
    `        <ns2:SchemaVersion>1-0E</ns2:SchemaVersion>\n` +
    `        <ns2:TargetNamespace>http://crd.gov.pl/wzor/2023/06/29/12648/</ns2:TargetNamespace>\n` +
    `        <ns2:Value>FA</ns2:Value>\n` +
    `      </ns2:FormCode>\n` +
    `    </DocumentType>\n` +
    `    <Token>${escapeXml(encryptedTokenB64)}</Token>\n` +
    `  </ns3:Context>\n` +
    `</ns3:InitSessionTokenRequest>\n`
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractSessionToken(json: Record<string, unknown>): string {
  const st = json.sessionToken;
  if (typeof st === "string" && st.length) return st;
  if (st && typeof st === "object") {
    const t = (st as Record<string, unknown>).token;
    if (typeof t === "string" && t.length) return t;
  }
  throw new Error(
    "KSeF: nie znaleziono sessionToken.token w odpowiedzi InitToken.",
  );
}

async function readJsonBody(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { _raw: text } as Record<string, unknown>;
  }
}

function ksefHttpError(
  op: string,
  res: Response,
  json: Record<string, unknown>,
): Error {
  const detail =
    typeof json.message === "string"
      ? json.message
      : typeof json.title === "string"
        ? json.title
        : JSON.stringify(json).slice(0, 300);
  return new Error(`KSeF ${op} HTTP ${res.status}: ${detail}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
