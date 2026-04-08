import JSZip from "jszip";
import { z } from "zod";

import { appendAllPdfDocuments, type PdfContext } from "@/lib/document-pdfs";
import {
  ownerUnitSchema,
  RENTAL_PLATFORM_LABELS,
  type OwnerUnitOutput,
} from "@/lib/owner-form-schema";

/** Dane z rekordu `orders` potrzebne do PDF (płaskie + opcjonalnie quiz). */
export type DocumentsOrderInput = {
  owner_name: string | null;
  owner_city: string | null;
  owner_address: string | null;
  owner_zip: string | null;
  owner_pesel?: string | null;
  /** Seria i nr dowodu / paszportu — do PDF (płaski wiersz). */
  owner_identity_document?: string | null;
  email?: string | null;
  owner_phone?: string | null;
  property_address: string | null;
  property_city: string | null;
  property_zip?: string | null;
  property_type: string | null;
  property_area?: number | null;
  property_floor?: number | null;
  rental_platform?: string[] | null;
  rental_since?: string | null;
};

/** Wejście z rekordu `orders` — pozwala wyciągnąć `owner_units_json` z `quiz_answers`. */
export type OrderDocumentBuildInput = DocumentsOrderInput & {
  quiz_answers?: Record<string, unknown> | null;
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  mieszkanie: "Mieszkanie",
  dom: "Dom",
  apartament: "Apartament",
  pokoj: "Pokój",
};

function safe(s: string | null | undefined): string {
  return (s ?? "").trim();
}

function dash(s: string): string {
  const t = s.trim();
  return t ? t : "—";
}

function formatPropertyTypeForPdf(raw: string | null | undefined): string {
  const s = safe(raw);
  if (!s) return "";
  const key = s.toLowerCase();
  return PROPERTY_TYPE_LABELS[key] ?? s;
}

function formatAreaPdf(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return `${String(n).replace(".", ",")} m²`;
}

function formatFloorPdf(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—";
  return String(n);
}

function platformsLine(ids: string[] | null | undefined): string {
  if (!ids?.length) return "—";
  return ids
    .map(
      (id) =>
        RENTAL_PLATFORM_LABELS[id as keyof typeof RENTAL_PLATFORM_LABELS] ??
        id
    )
    .join(", ");
}

function q3GuestLabel(q: string | undefined): string {
  if (q === "up_to_4") return "do 4 osób (odpowiedź z quizu)";
  if (q === "5_to_10") return "5–10 osób (odpowiedź z quizu)";
  if (q === "above_10") return "powyżej 10 osób (odpowiedź z quizu)";
  return "—";
}

function listingOrPlaceholder(name: string | undefined): string {
  const t = safe(name);
  return t ? t : "— (np. cały lokal / pokoje — doprecyzuj w razie potrzeby)";
}

type GlobalOrderFields = {
  email: string;
  phone: string;
  platforms: string[];
  rentalSinceYear: string;
  quizAnswers: Record<string, string>;
};

function extractGlobal(row: OrderDocumentBuildInput): GlobalOrderFields {
  const qa = row.quiz_answers;
  const quizAnswers =
    qa && typeof qa === "object" && !Array.isArray(qa)
      ? (qa as Record<string, string>)
      : {};
  return {
    email: safe(row.email),
    phone: safe(row.owner_phone),
    platforms: Array.isArray(row.rental_platform) ? row.rental_platform : [],
    rentalSinceYear: safe(row.rental_since),
    quizAnswers,
  };
}

function buildPdfContext(
  u: OwnerUnitOutput,
  g: GlobalOrderFields
): PdfContext {
  const peselStr = u.pesel?.trim() ?? "";
  return {
    ownerName: safe(u.fullName),
    ownerCity: safe(u.city),
    ownerAddr: safe(u.address),
    ownerZip: safe(u.zip),
    ownerPesel: dash(peselStr),
    ownerEmail: dash(g.email),
    ownerPhone: dash(g.phone),
    idDocument: dash(u.identityDocument ?? ""),
    propAddr: safe(u.propertyAddress),
    propCity: safe(u.propertyCity),
    propZip: safe(u.propertyZip),
    propType: formatPropertyTypeForPdf(u.propertyType),
    propAreaM2: formatAreaPdf(u.propertyArea ?? undefined),
    propFloor: formatFloorPdf(u.propertyFloor ?? undefined),
    listingName: listingOrPlaceholder(u.listingName ?? undefined),
    platformsLine: platformsLine(g.platforms),
    rentalSinceYear: g.rentalSinceYear || "—",
    guestGroupLabel: q3GuestLabel(g.quizAnswers.q3),
    today: new Date().toLocaleDateString("pl-PL"),
  };
}

/** Fallback bez `owner_units_json` — dane z płaskich kolumn zamówienia (lokal 1). */
function flatRowToPdfContext(row: OrderDocumentBuildInput): PdfContext {
  const g = extractGlobal(row);
  const peselStr = safe(row.owner_pesel ?? "");
  return {
    ownerName: safe(row.owner_name),
    ownerCity: safe(row.owner_city),
    ownerAddr: safe(row.owner_address),
    ownerZip: safe(row.owner_zip),
    ownerPesel: dash(peselStr),
    ownerEmail: dash(g.email),
    ownerPhone: dash(g.phone),
    idDocument: dash(safe(row.owner_identity_document ?? "")),
    propAddr: safe(row.property_address),
    propCity: safe(row.property_city),
    propZip: safe(row.property_zip),
    propType: formatPropertyTypeForPdf(row.property_type),
    propAreaM2: formatAreaPdf(row.property_area ?? undefined),
    propFloor: formatFloorPdf(row.property_floor ?? undefined),
    listingName: "— (uzupełnij w formularzu przy zamówieniu wielu lokali)",
    platformsLine: platformsLine(g.platforms),
    rentalSinceYear: g.rentalSinceYear || "—",
    guestGroupLabel: q3GuestLabel(g.quizAnswers.q3),
    today: new Date().toLocaleDateString("pl-PL"),
  };
}

const unitsArraySchema = z.array(ownerUnitSchema);

function parseOwnerUnitsFromOrder(
  row: OrderDocumentBuildInput
): OwnerUnitOutput[] | null {
  const qa = row.quiz_answers;
  if (!qa || typeof qa !== "object") return null;
  const raw = (qa as Record<string, unknown>).owner_units_json;
  let parsed: unknown;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  } else if (Array.isArray(raw)) {
    parsed = raw;
  } else {
    return null;
  }
  const result = unitsArraySchema.safeParse(parsed);
  return result.success ? result.data : null;
}

/**
 * Buduje paczkę ZIP z 6 plikami PDF na lokal.
 * Przy wielu lokalach: podfoldery `Lokal_nr_1`, `Lokal_nr_2`, … (z `owner_units_json` w `quiz_answers`).
 */
export async function buildDocumentsZipBuffer(
  o: OrderDocumentBuildInput
): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const units = parseOwnerUnitsFromOrder(o);
  const global = extractGlobal(o);

  if (units && units.length > 0) {
    units.forEach((u, i) => {
      const folder = `Lokal_nr_${i + 1}`;
      appendAllPdfDocuments(zip, buildPdfContext(u, global), folder);
    });
  } else {
    appendAllPdfDocuments(zip, flatRowToPdfContext(o), "Lokal_nr_1");
  }

  return zip.generateAsync({ type: "arraybuffer" });
}

/** Przykładowe dane demonstracyjne (nie są Twoimi danymi z formularza). */
export const SAMPLE_DOCUMENTS_ORDER: OrderDocumentBuildInput = {
  owner_name: "Jan Kowalski",
  owner_city: "Warszawa",
  owner_address: "ul. Przykładowa 12/4",
  owner_zip: "00-001",
  owner_pesel: "90010112345",
  email: "jan@example.com",
  owner_phone: "+48 600 000 000",
  property_address: "ul. Wakacyjna 5",
  property_city: "Zakopane",
  property_zip: "34-500",
  property_type: "Mieszkanie",
  property_area: 45,
  property_floor: 2,
  rental_platform: ["airbnb", "booking"],
  rental_since: "2024",
  quiz_answers: { q3: "up_to_4" },
};
