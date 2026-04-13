"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  QUIZ_STORAGE_KEY,
  DATA_STORAGE_KEY,
  PREPARED_ORDER_STORAGE_KEY,
  type MunicipalityLite,
  type QuizState,
} from "@/lib/checkout-flow";
import OrderFormConsents, { type ConsentState } from "@/components/OrderFormConsents";
import {
  emptyOwnerDraft,
  emptyPropertyDraft,
  normalizeLowercase,
  savePrepareDraft,
  type OwnerDraft,
  type PropertyDraft,
  validateOwnersStep,
  validatePropertiesStep,
} from "@/lib/wizard-draft";
import { OwnerDataStep, PropertyDataStep } from "@/components/wizard/OwnerPropertyFormSteps";
import type { OrderDocumentFormInput } from "@/lib/order-input-schema";

const initial: Omit<QuizState, "requiresRegistration"> = {
  propertyCount: 1,
  managementAuthorizationFileName: "",
  q1: "platform",
  q2City: "",
  q3: "up_to_4",
  q4: "owner",
  q5: "no_number",
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeUppercase(value: string): string {
  return value.toLocaleUpperCase("pl-PL");
}

const VOIVODESHIP_CITIES = new Set(
  [
    "Białystok",
    "Bydgoszcz",
    "Gdańsk",
    "Gorzów Wielkopolski",
    "Katowice",
    "Kielce",
    "Kraków",
    "Lublin",
    "Łódź",
    "Olsztyn",
    "Opole",
    "Poznań",
    "Rzeszów",
    "Szczecin",
    "Toruń",
    "Warszawa",
    "Wrocław",
    "Zielona Góra",
  ].map(normalizeText)
);

export function QuizClient() {
  type ErrorTarget = { step: number; selector: string };
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [propertyCountOption, setPropertyCountOption] = useState<"1" | "2" | "3" | "custom">("1");
  const [propertyCountCustom, setPropertyCountCustom] = useState("");
  const [result, setResult] = useState<QuizState | null>(null);
  const [municipalities, setMunicipalities] = useState<MunicipalityLite[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [authorizationUploadStatus, setAuthorizationUploadStatus] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");
  const [authorizationUploadError, setAuthorizationUploadError] = useState<string | null>(null);
  const [owners, setOwners] = useState<OwnerDraft[]>([emptyOwnerDraft()]);
  const [properties, setProperties] = useState<PropertyDraft[]>([emptyPropertyDraft()]);
  const [stepError, setStepError] = useState<string | null>(null);
  const [consents, setConsents] = useState<ConsentState>({
    termsAccepted: false,
    digitalContentConsent: false,
    analyticsConsent: false,
    marketingConsent: false,
  });
  const [consentId, setConsentId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [errorTarget, setErrorTarget] = useState<ErrorTarget | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(municipalities, {
        keys: ["name", "full_name", "voivodeship"],
        threshold: 0.3,
      }),
    [municipalities]
  );

  const suggestions = useMemo(() => {
    const q = form.q2City.trim();
    if (q.length < 2) return [];
    const fuzzy = fuse.search(q).slice(0, 20).map((r) => r.item);
    if (fuzzy.length > 0) return fuzzy;

    const nq = normalizeText(q);
    return municipalities
      .filter((m) => {
        const hay = `${m.name} ${m.full_name} ${m.voivodeship}`;
        return normalizeText(hay).includes(nq);
      })
      .slice(0, 20);
  }, [form.q2City, fuse, municipalities]);

  const isVoivodeshipCity = useMemo(
    () => VOIVODESHIP_CITIES.has(normalizeText(form.q2City)),
    [form.q2City]
  );
  const requiresAuthorizationUpload = step === 5 && form.q4 === "manager";
  const canProceedFromCurrentStep =
    !requiresAuthorizationUpload || authorizationUploadStatus === "uploaded";

  useEffect(() => {
    const n = Math.max(1, Math.min(20, form.propertyCount ?? 1));
    setOwners((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(emptyOwnerDraft());
      return next.slice(0, n);
    });
    setProperties((prev) => {
      const next = [...prev];
      while (next.length < n) next.push(emptyPropertyDraft());
      return next.slice(0, n);
    });
  }, [form.propertyCount]);

  function patchOwner<K extends keyof OwnerDraft>(idx: number, key: K, value: OwnerDraft[K]) {
    setOwners((prev) =>
      prev.map((owner, i) => {
        if (i !== idx) return owner;
        const nextValue = (() => {
          if (typeof value !== "string") return value;
          if (key === "email") return normalizeLowercase(value) as OwnerDraft[K];
          return normalizeUppercase(value) as OwnerDraft[K];
        })();
        return { ...owner, [key]: nextValue };
      })
    );
  }

  function patchProperty<K extends keyof PropertyDraft>(
    idx: number,
    key: K,
    value: PropertyDraft[K]
  ) {
    setProperties((prev) =>
      prev.map((property, i) => {
        if (i !== idx) return property;
        if (key === "property_type") {
          const nextType = value as PropertyDraft["property_type"];
          return {
            ...property,
            property_type: nextType,
            property_floor: nextType === "dom" ? undefined : property.property_floor,
          };
        }
        const nextValue =
          typeof value === "string" ? (normalizeUppercase(value) as PropertyDraft[K]) : value;
        return { ...property, [key]: nextValue };
      })
    );
  }

  function copyPropertyFromFirst(idx: number) {
    if (idx === 0) return;
    setProperties((prev) => {
      if (!prev[0]) return prev;
      return prev.map((property, i) => (i === idx ? { ...prev[0] } : property));
    });
  }

  function copyOwnerFromFirst(idx: number) {
    if (idx === 0) return;
    setOwners((prev) => {
      if (!prev[0]) return prev;
      return prev.map((owner, i) => (i === idx ? { ...prev[0] } : owner));
    });
  }

  function inferValidationTarget(message: string, currentStep: number): ErrorTarget | null {
    const match = message.match(/nr\s+(\d+)/i);
    const idx = Math.max(0, Number(match?.[1] ?? "1") - 1);
    const lower = message.toLowerCase();

    if (currentStep === 6) {
      if (lower.includes("imię i nazwisko")) return { step: 6, selector: `#owner-${idx}-owner_name` };
      if (lower.includes("e-mail")) return { step: 6, selector: `#owner-${idx}-email` };
      if (lower.includes("telefon")) return { step: 6, selector: `#owner-${idx}-owner_phone` };
      if (lower.includes("adres korespondencyjny")) return { step: 6, selector: `#owner-${idx}-owner_address` };
      if (lower.includes("pesel")) return { step: 6, selector: `#owner-${idx}-owner_pesel` };
      if (lower.includes("dowód") || lower.includes("paszport")) {
        return { step: 6, selector: `#owner-${idx}-owner_identity_document` };
      }
    }

    if (currentStep === 7 && lower.includes("adres lokalu")) {
      return { step: 7, selector: `#property-${idx}-property_address` };
    }

    return null;
  }

  function focusAndHighlightSelector(selector: string) {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      if ("focus" in element) {
        (element as HTMLInputElement).focus();
      }
      element.classList.add("field-error-highlight");
      window.setTimeout(() => element.classList.remove("field-error-highlight"), 1800);
    }, 80);
  }

  function goToError() {
    if (!errorTarget) return;
    setStepError(null);
    setPaymentError(null);
    setStep(errorTarget.step);
    focusAndHighlightSelector(errorTarget.selector);
  }

  function next() {
    setStepError(null);
    setErrorTarget(null);
    if (step === 2 && form.q1 === "long_term") {
      const payload: QuizState = { ...form, requiresRegistration: false };
      payload.propertyCount = form.propertyCount ?? 1;
      setResult(payload);
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
      return;
    }
    if (step === 6) {
      const err = validateOwnersStep(owners);
      if (err) {
        setStepError(err);
        setErrorTarget(inferValidationTarget(err, 6));
        return;
      }
      setOwners((prev) =>
        prev.map((o) => ({
          ...o,
          owner_identity_document: (o.owner_identity_document ?? "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, ""),
        }))
      );
    }
    if (step === 7) {
      const err = validatePropertiesStep(properties);
      if (err) {
        setStepError(err);
        setErrorTarget(inferValidationTarget(err, 7));
        return;
      }
      savePrepareDraft({ owners, properties });
    }
    setStep((s) => Math.min(8, s + 1));
  }

  useEffect(() => {
    if (step !== 3) return;
    if (municipalities.length > 0) return;
    let cancelled = false;

    (async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch("/api/municipalities/all");
        const json = (await res.json()) as { results?: MunicipalityLite[]; error?: string };
        if (!res.ok) throw new Error(json.error || "Błąd pobierania listy gmin");
        if (!cancelled) {
          setMunicipalities(json.results ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setSearchError(e instanceof Error ? e.message : "Błąd pobierania listy gmin");
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, municipalities.length]);
  function back() {
    setStepError(null);
    setErrorTarget(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function finish() {
    savePrepareDraft({ owners, properties });
    const requiresRegistration = form.q1 !== "long_term" && form.q5 !== "has_number";
    const customCount = Number(propertyCountCustom);
    const selectedCount =
      propertyCountOption === "custom" ? (Number.isFinite(customCount) && customCount > 0 ? customCount : 1) : Number(propertyCountOption);
    const payload: QuizState = { ...form, requiresRegistration };
    payload.propertyCount = selectedCount;
    setResult(payload);
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
  }

  async function searchMunicipalities(q: string) {
    const normalizedQuery = normalizeUppercase(q);
    setForm((p) => ({
      ...p,
      q2City: normalizedQuery,
      q2TerytCode: undefined,
      municipality: undefined,
    }));
    if (normalizedQuery.trim().length < 2) {
      return;
    }
    const hasFullMunicipalities = municipalities.length >= 2400;
    if (hasFullMunicipalities) {
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const rawQuery = normalizedQuery.trim();
      const res = await fetch(`/api/municipalities/search?q=${encodeURIComponent(rawQuery)}`);
      const json = (await res.json()) as { results?: MunicipalityLite[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Błąd wyszukiwania gmin");

      let results = json.results ?? [];

      // If API returns nothing for accented input, retry without diacritics.
      if (results.length === 0) {
        const fallbackQuery = normalizeText(rawQuery);
        if (fallbackQuery && fallbackQuery !== rawQuery.toLowerCase()) {
          const resFallback = await fetch(
            `/api/municipalities/search?q=${encodeURIComponent(fallbackQuery)}`
          );
          const jsonFallback = (await resFallback.json()) as {
            results?: MunicipalityLite[];
            error?: string;
          };
          if (resFallback.ok) {
            results = jsonFallback.results ?? [];
          }
        }
      }

      setMunicipalities(results);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Błąd wyszukiwania gmin");
      setMunicipalities([]);
    } finally {
      setSearching(false);
    }
  }

  function chooseMunicipality(m: MunicipalityLite) {
    setForm((p) => ({
      ...p,
      q2City: normalizeUppercase(m.name),
      q2TerytCode: m.teryt_code,
      municipality: m,
    }));
  }

  async function uploadAuthorizationFile(file: File) {
    setAuthorizationUploadStatus("uploading");
    setAuthorizationUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("city", form.q2City || "");
      data.append("propertyCount", String(form.propertyCount ?? ""));

      const res = await fetch("/api/authorizations/upload", {
        method: "POST",
        body: data,
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        warning?: string;
        sent?: boolean;
      };

      if (!res.ok) {
        throw new Error(json.error || "Nie udało się wysłać pliku pełnomocnictwa.");
      }

      setAuthorizationUploadStatus("uploaded");
      setForm((p) => ({ ...p, managementAuthorizationFileName: file.name }));
      if (json.warning) {
        setAuthorizationUploadError(json.warning);
      }
    } catch (e) {
      setAuthorizationUploadStatus("error");
      setAuthorizationUploadError(
        e instanceof Error ? e.message : "Nie udało się wysłać pliku pełnomocnictwa."
      );
    }
  }

  function buildOrderPayload(): OrderDocumentFormInput {
    const primaryOwner = owners[0] ?? emptyOwnerDraft();
    const primaryProperty = properties[0] ?? emptyPropertyDraft();
    const ownerUnitsJson = JSON.stringify(
      properties.map((property, idx) => {
        const owner = owners[idx] ?? emptyOwnerDraft();
        return {
          fullName: owner.owner_name,
          city: owner.owner_city,
          address: owner.owner_address,
          zip: owner.owner_zip,
          pesel: owner.owner_pesel,
          identityDocument: owner.owner_identity_document,
          propertyAddress: property.property_address,
          propertyCity: property.property_city,
          propertyZip: property.property_zip,
          propertyType: property.property_type,
          propertyArea: property.property_area,
          propertyFloor: property.property_floor,
          listingName: `${property.property_type} NR ${idx + 1}`,
        };
      })
    );

    return {
      owner_name: primaryOwner.owner_name,
      owner_city: primaryOwner.owner_city,
      owner_address: primaryOwner.owner_address,
      owner_zip: primaryOwner.owner_zip,
      owner_pesel: primaryOwner.owner_pesel,
      owner_identity_document: primaryOwner.owner_identity_document,
      email: primaryOwner.email,
      owner_phone: primaryOwner.owner_phone,
      property_address: primaryProperty.property_address,
      property_city: primaryProperty.property_city,
      property_zip: primaryProperty.property_zip,
      property_type: primaryProperty.property_type,
      property_area: primaryProperty.property_area,
      property_floor: primaryProperty.property_floor,
      rental_platform: [],
      rental_since: "",
      quiz_answers: {
        q3: form.q3,
        owner_units_json: ownerUnitsJson,
      },
    };
  }

  async function proceedToPayment() {
    setPaymentError(null);
    setErrorTarget(null);
    if (!consents.termsAccepted || !consents.digitalContentConsent) {
      setPaymentError(
        "Zaakceptuj Regulamin, Politykę prywatności oraz zgodę na natychmiastowe wykonanie umowy."
      );
      setErrorTarget({ step: 8, selector: "#consent-terms" });
      return;
    }
    setPaymentLoading(true);
    try {
      if (!consentId) {
        const sessionId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : String(Date.now());
        try {
          const consentRes = await fetch("/api/log-consent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              termsAccepted: consents.termsAccepted,
              digitalContentConsent: consents.digitalContentConsent,
              analyticsConsent: consents.analyticsConsent,
              marketingConsent: consents.marketingConsent,
              email: owners[0]?.email ?? "",
              sessionId,
            }),
          });
          if (!consentRes.ok) {
            setConsentId(`local-${Date.now()}`);
          } else {
            const j = (await consentRes.json()) as { consentId: string };
            setConsentId(j.consentId);
          }
        } catch {
          setConsentId(`local-${Date.now()}`);
        }
      }

      const payload = buildOrderPayload();
      const currentCount = Math.max(1, Math.floor(form.propertyCount ?? 1));
      const pricingQuizPayload: QuizState = {
        ...form,
        propertyCount: currentCount,
        requiresRegistration: form.q1 !== "long_term" && form.q5 !== "has_number",
      };
      sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(pricingQuizPayload));
      sessionStorage.setItem(PREPARED_ORDER_STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(pricingQuizPayload));
      localStorage.setItem(PREPARED_ORDER_STORAGE_KEY, JSON.stringify(payload));
      sessionStorage.setItem(
        DATA_STORAGE_KEY,
        JSON.stringify({
          fullName: payload.owner_name,
          address: payload.owner_address,
          city: payload.owner_city,
          zip: payload.owner_zip,
          phone: payload.owner_phone,
          email: payload.email,
          propertyAddress: payload.property_address,
          propertyCity: payload.property_city,
          propertyZip: payload.property_zip ?? "",
          propertyType: payload.property_type,
          platforms: payload.rental_platform ?? [],
          rentalSince: payload.rental_since ?? "",
        })
      );
      localStorage.setItem(
        DATA_STORAGE_KEY,
        JSON.stringify({
          fullName: payload.owner_name,
          address: payload.owner_address,
          city: payload.owner_city,
          zip: payload.owner_zip,
          phone: payload.owner_phone,
          email: payload.email,
          propertyAddress: payload.property_address,
          propertyCity: payload.property_city,
          propertyZip: payload.property_zip ?? "",
          propertyType: payload.property_type,
          platforms: payload.rental_platform ?? [],
          rentalSince: payload.rental_since ?? "",
        })
      );
      router.push("/platnosc");
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : "Nie udało się przejść do płatności.");
    } finally {
      setPaymentLoading(false);
    }
  }

  useEffect(() => {
    if (!result) return;
    if (result.q1 !== "long_term") return;
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [result, router]);

  if (result) {
    const shouldAutoReturnHome = !result.requiresRegistration && result.q1 === "long_term";
    return (
      <main className="page-shell">
        <h1 className="page-title">
          {result.requiresRegistration
            ? "Twój lokal wymaga rejestracji"
            : "Prawdopodobnie nie musisz się rejestrować"}
        </h1>
        <p className="page-intro">
          {result.requiresRegistration
            ? "Przejdź dalej i uzupełnij formularz danych do dokumentów."
            : shouldAutoReturnHome
              ? "Nie obowiązuje Cię rejestracja. Za 3 sekundy nastąpi powrót na stronę główną."
              : "Możesz mimo to pobrać pakiet dokumentów dla bezpieczeństwa."}
        </p>
        {!shouldAutoReturnHome ? (
          <button className="btn-primary" onClick={() => router.push("/dane")}>
            Przejdź do formularza
          </button>
        ) : null}
      </main>
    );
  }

  return (
    <main className="page-shell">
      <h1 className="page-title">KROK {step}</h1>
      {stepError ? (
        <p className="wizard-error" role="alert">
          {stepError}
          {errorTarget ? (
            <>
              {" "}
              <button type="button" className="btn-secondary" onClick={goToError}>
                Powrót do błędu
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {step === 1 && (
        <div className="field">
          <span>Ile posiadasz lokali?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "1"}
                onChange={() => {
                  setPropertyCountOption("1");
                  setForm((p) => ({ ...p, propertyCount: 1 }));
                }}
              />
              <span>1 lokal</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "2"}
                onChange={() => {
                  setPropertyCountOption("2");
                  setForm((p) => ({ ...p, propertyCount: 2 }));
                }}
              />
              <span>2 lokale</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "3"}
                onChange={() => {
                  setPropertyCountOption("3");
                  setForm((p) => ({ ...p, propertyCount: 3 }));
                }}
              />
              <span>3 lokale</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "custom"}
                onChange={() => setPropertyCountOption("custom")}
              />
              <span>Podaj ilość</span>
            </label>
          </div>
          {propertyCountOption === "custom" ? (
            <input
              type="number"
              min={1}
              step={1}
              value={propertyCountCustom}
              onChange={(e) => {
                const raw = e.target.value;
                setPropertyCountCustom(raw);
                const n = Number(raw);
                if (Number.isFinite(n) && n > 0) {
                  setForm((p) => ({ ...p, propertyCount: n }));
                }
              }}
              placeholder="Podaj liczbę lokali"
            />
          ) : null}
        </div>
      )}
      {step === 2 && (
        <div className="field">
          <span>Czy wynajmujesz krótkoterminowo poniżej 30 dni?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="rent-type"
                checked={form.q1 === "platform"}
                onChange={() => setForm((p) => ({ ...p, q1: "platform" }))}
              />
              <span>Tak, przez platformy</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="rent-type"
                checked={form.q1 === "direct"}
                onChange={() => setForm((p) => ({ ...p, q1: "direct" }))}
              />
              <span>Tak, bezpośrednio</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="rent-type"
                checked={form.q1 === "long_term"}
                onChange={() => setForm((p) => ({ ...p, q1: "long_term" }))}
              />
              <span>Nie, długoterminowo</span>
            </label>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <label className="field">
          <span>W jakim mieście jest Twój lokal?</span>
            <input
              value={form.q2City}
              onChange={(e) => void searchMunicipalities(e.target.value)}
              placeholder="Wpisz nazwę gminy lub dzielnicy, np. Warszawa Ursynów"
            />
          </label>
          {searching ? <p className="wizard-hint">Szukam gmin...</p> : null}
          {searchError ? <p className="wizard-error">{searchError}</p> : null}
          {suggestions.length > 0 && !form.q2TerytCode ? (
            <ul className="municipality-list">
              {suggestions.map((m) => (
                <li key={m.teryt_code}>
                  <button
                    type="button"
                    className="municipality-item"
                    onClick={() => chooseMunicipality(m)}
                  >
                    {m.name} ({m.type}, {m.voivodeship})
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {form.q2TerytCode && isVoivodeshipCity ? (
            <p className="wizard-hint">
              Reguła dla miast wojewódzkich: właściwe są urzędy gminy (dzielnic). Upewnij się, że
              wybierasz właściwy urząd dla dzielnicy lokalu.
            </p>
          ) : null}
        </div>
      )}
      {step === 4 && (
        <div className="field">
          <span>Ile osób może przebywać jednocześnie?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="capacity"
                checked={form.q3 === "up_to_4"}
                onChange={() => setForm((p) => ({ ...p, q3: "up_to_4" }))}
              />
              <span>Do 4 osób</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="capacity"
                checked={form.q3 === "5_to_10"}
                onChange={() => setForm((p) => ({ ...p, q3: "5_to_10" }))}
              />
              <span>5-10 osób</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="capacity"
                checked={form.q3 === "above_10"}
                onChange={() => setForm((p) => ({ ...p, q3: "above_10" }))}
              />
              <span>Powyżej 10 osób</span>
            </label>
          </div>
        </div>
      )}
      {step === 5 && (
        <div className="field">
          <span>Czy jesteś właścicielem lokalu?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="owner-type"
                checked={form.q4 === "owner"}
                onChange={() => setForm((p) => ({ ...p, q4: "owner" }))}
              />
              <span>Tak, jestem właścicielem</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="owner-type"
                checked={form.q4 === "subtenant"}
                onChange={() => setForm((p) => ({ ...p, q4: "subtenant" }))}
              />
              <span>Podnajemca / zarządca</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="owner-type"
                checked={form.q4 === "manager"}
                onChange={() => setForm((p) => ({ ...p, q4: "manager" }))}
              />
              <span>Zarządzam lokalami innych</span>
            </label>
          </div>
          {form.q4 === "manager" ? (
            <label className="field">
              <span>Dodaj plik pełnomocnictwa/pełnomocnictw (PDF/JPG/PNG)</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void uploadAuthorizationFile(file);
                }}
              />
              {authorizationUploadStatus === "uploading" ? (
                <p className="wizard-hint">Wysyłam plik na adres kontakt@najembezkary.pl...</p>
              ) : null}
              {authorizationUploadStatus === "uploaded" ? (
                <p className="wizard-hint">
                  Plik został automatycznie przesłany: {form.managementAuthorizationFileName}
                </p>
              ) : null}
              {authorizationUploadStatus === "uploaded" && authorizationUploadError ? (
                <p className="wizard-hint">{authorizationUploadError}</p>
              ) : null}
              {authorizationUploadStatus === "error" && authorizationUploadError ? (
                <p className="wizard-error">{authorizationUploadError}</p>
              ) : null}
            </label>
          ) : null}
        </div>
      )}
      {step === 6 ? (
        <OwnerDataStep
          owners={owners}
          patchOwner={patchOwner}
          copyOwnerFromFirst={copyOwnerFromFirst}
        />
      ) : null}
      {step === 7 ? (
        <PropertyDataStep
          properties={properties}
          patchProperty={patchProperty}
          copyPropertyFromFirst={copyPropertyFromFirst}
        />
      ) : null}
      {step === 8 ? (
        <section className="wizard-panel">
          <h2>Podsumowanie i zgody</h2>
          <dl className="summary">
            <div className="summary-row">
              <dt>Liczba lokali</dt>
              <dd>{String(form.propertyCount ?? 1)}</dd>
            </div>
            <div className="summary-row">
              <dt>Gmina</dt>
              <dd>{form.q2City || "—"}</dd>
            </div>
            {properties.map((property, idx) => {
              const owner = owners[idx];
              return (
                <div key={`summary-local-${idx}`} className="wizard-multi-block">
                  <h3>Lokal nr {idx + 1}</h3>
                  <dl className="summary">
                    <div className="summary-row">
                      <dt>Właściciel</dt>
                      <dd>{owner?.owner_name || "—"}</dd>
                    </div>
                    <div className="summary-row">
                      <dt>E-mail</dt>
                      <dd>{owner?.email || "—"}</dd>
                    </div>
                    <div className="summary-row">
                      <dt>Telefon</dt>
                      <dd>{owner?.owner_phone || "—"}</dd>
                    </div>
                    <div className="summary-row">
                      <dt>Adres lokalu</dt>
                      <dd>{property.property_address || "—"}</dd>
                    </div>
                    <div className="summary-row">
                      <dt>Kod i miasto</dt>
                      <dd>{`${property.property_zip || "—"} ${property.property_city || ""}`.trim()}</dd>
                    </div>
                    <div className="summary-row">
                      <dt>Rodzaj</dt>
                      <dd>{property.property_type || "—"}</dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </dl>
          <OrderFormConsents onChange={setConsents} />
          {paymentError ? (
            <p className="wizard-error">
              {paymentError}{" "}
              {errorTarget ? (
                <button type="button" className="btn-secondary" onClick={goToError}>
                  Powrót do błędu
                </button>
              ) : null}
            </p>
          ) : null}
          <button type="button" className="btn-primary" onClick={() => void proceedToPayment()} disabled={paymentLoading}>
            {paymentLoading ? "Przetwarzanie…" : "Przejdź do płatności"}
          </button>
        </section>
      ) : null}

      <div className="wizard-nav">
        {step > 1 && step < 8 ? (
          <button className="btn-secondary" onClick={back}>
            Wstecz
          </button>
        ) : step === 1 ? (
          <button className="btn-secondary" onClick={() => router.push("/")}>
            Powrót
          </button>
        ) : (
          <span />
        )}
        {step < 8 ? (
          <button className="btn-primary" onClick={next} disabled={!canProceedFromCurrentStep}>
            Dalej
          </button>
        ) : (
          <span />
        )}
      </div>
      {requiresAuthorizationUpload && !canProceedFromCurrentStep ? (
        <p className="wizard-error">
          Aby przejść dalej, dodaj i prześlij pełnomocnictwo (PDF/JPG/PNG).
        </p>
      ) : null}
    </main>
  );
}
