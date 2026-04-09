import type { OrderDocumentFormInput } from "@/lib/order-input-schema";

export const PREPARE_DRAFT_KEY = "nbk.prepareDraft.v1";

export const PESEL_PATTERN = /^\d{11}$/;
export const ID_DOC_PATTERN = /^[A-Z]{3}\d{6}$/;

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  mieszkanie: "Mieszkanie",
  dom: "Dom",
  apartament: "Apartament",
  pokoj: "Pokój",
};

export type OwnerDraft = {
  owner_name: string;
  owner_city: string;
  owner_address: string;
  owner_zip: string;
  owner_pesel: string;
  owner_identity_document: string;
  email: string;
  owner_phone: string;
};

export type PropertyDraft = {
  property_address: string;
  property_city: string;
  property_zip: string;
  property_type: OrderDocumentFormInput["property_type"];
  property_area?: number;
  property_floor?: number;
};

export function normalizeUppercase(value: string) {
  return value.toLocaleUpperCase("pl-PL");
}

export function normalizeLowercase(value: string) {
  return value.toLocaleLowerCase("pl-PL");
}

export function formatPolishPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export function emptyOwnerDraft(): OwnerDraft {
  return {
    owner_name: "",
    owner_city: "",
    owner_address: "",
    owner_zip: "",
    owner_pesel: "",
    owner_identity_document: "",
    email: "",
    owner_phone: "",
  };
}

export function emptyPropertyDraft(): PropertyDraft {
  return {
    property_address: "",
    property_city: "",
    property_zip: "",
    property_type: "mieszkanie",
    property_area: undefined,
    property_floor: undefined,
  };
}

export function validateOwnersStep(owners: OwnerDraft[]): string | null {
  for (let i = 0; i < owners.length; i++) {
    const owner = owners[i]!;
    if (owner.owner_name.trim().length < 2) {
      return `Podaj imię i nazwisko właściciela nr ${i + 1}.`;
    }
    if (!owner.email.includes("@")) {
      return `Podaj prawidłowy e-mail właściciela nr ${i + 1}.`;
    }
    if (owner.owner_phone.trim().length < 5) {
      return `Podaj numer telefonu właściciela nr ${i + 1}.`;
    }
    if (!owner.owner_city.trim() || !owner.owner_address.trim() || !owner.owner_zip.trim()) {
      return `Uzupełnij adres korespondencyjny właściciela nr ${i + 1}.`;
    }
    const pesel = (owner.owner_pesel ?? "").trim();
    if (!PESEL_PATTERN.test(pesel)) {
      return `PESEL właściciela nr ${i + 1} musi zawierać dokładnie 11 cyfr.`;
    }
    const identityDoc = (owner.owner_identity_document ?? "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!ID_DOC_PATTERN.test(identityDoc)) {
      return `Dowód/paszport właściciela nr ${i + 1} musi mieć format: 3 litery i 6 cyfr (np. ABC123456).`;
    }
  }
  return null;
}

export function validatePropertiesStep(properties: PropertyDraft[]): string | null {
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]!;
    if (!property.property_address.trim() || !property.property_city.trim()) {
      return `Uzupełnij adres lokalu nr ${i + 1}.`;
    }
  }
  return null;
}

export type PrepareDraftPayload = {
  owners: OwnerDraft[];
  properties: PropertyDraft[];
};

export function savePrepareDraft(payload: PrepareDraftPayload) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PREPARE_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadPrepareDraft(): PrepareDraftPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREPARE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PrepareDraftPayload;
    if (!Array.isArray(parsed.owners) || !Array.isArray(parsed.properties)) return null;
    return parsed;
  } catch {
    return null;
  }
}
