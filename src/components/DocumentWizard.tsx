"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { RENTAL_PLATFORM_LABELS } from "@/lib/owner-form-schema";
import { QUIZ_STORAGE_KEY, type QuizState } from "@/lib/checkout-flow";
import OrderFormConsents, {
  type ConsentState,
} from "@/components/OrderFormConsents";
import type { OrderDocumentFormInput } from "@/lib/order-input-schema";
import {
  emptyOwnerDraft,
  emptyPropertyDraft,
  loadPrepareDraft,
  savePrepareDraft,
  type OwnerDraft,
  type PropertyDraft,
  validateOwnersStep,
  validatePropertiesStep,
} from "@/lib/wizard-draft";
import { OwnerDataStep, PropertyDataStep } from "@/components/wizard/OwnerPropertyFormSteps";

const Q3_KEYS = ["up_to_4", "5_to_10", "above_10"] as const;

const Q3_LABELS: Record<(typeof Q3_KEYS)[number], string> = {
  up_to_4: "do 4 osób jednocześnie",
  "5_to_10": "5–10 osób jednocześnie",
  above_10: "powyżej 10 osób jednocześnie",
};

const PLATFORM_IDS = ["airbnb", "booking", "other", "direct"] as const;
const CURRENT_YEAR = new Date().getFullYear();
const RENTAL_SINCE_YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, idx) =>
  String(CURRENT_YEAR - idx)
);
function normalizeUppercase(value: string) {
  return value.toLocaleUpperCase("pl-PL");
}

function normalizeLowercase(value: string) {
  return value.toLocaleLowerCase("pl-PL");
}

function emptyForm(): OrderDocumentFormInput {
  return {
    owner_name: "",
    owner_city: "",
    owner_address: "",
    owner_zip: "",
    owner_pesel: "",
    owner_identity_document: "",
    email: "",
    owner_phone: "",
    property_address: "",
    property_city: "",
    property_zip: "",
    property_type: "mieszkanie",
    property_area: undefined,
    property_floor: undefined,
    rental_platform: [],
    rental_since: "",
    quiz_answers: { q3: "up_to_4" },
  };
}

const STEPS = 5;

export function DocumentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrderDocumentFormInput>(emptyForm);
  const [propertyCount, setPropertyCount] = useState(1);
  const [owners, setOwners] = useState<OwnerDraft[]>([emptyOwnerDraft()]);
  const [properties, setProperties] = useState<PropertyDraft[]>([emptyPropertyDraft()]);
  const [otherPlatformName, setOtherPlatformName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consents, setConsents] = useState<ConsentState>({
    termsAccepted: false,
    digitalContentConsent: false,
    analyticsConsent: false,
    marketingConsent: false,
  });
  const [consentId, setConsentId] = useState<string | null>(null);
  useEffect(() => {
    const draft = loadPrepareDraft();
    if (draft && draft.owners.length > 0 && draft.properties.length > 0) {
      const n = Math.min(
        20,
        Math.max(draft.owners.length, draft.properties.length, 1)
      );
      setPropertyCount(n);
      setOwners(
        Array.from({ length: n }, (_, i) => draft.owners[i] ?? emptyOwnerDraft())
      );
      setProperties(
        Array.from({ length: n }, (_, i) => draft.properties[i] ?? emptyPropertyDraft())
      );
      return;
    }
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return;
    try {
      const quiz = JSON.parse(raw) as QuizState;
      const nextCount =
        typeof quiz.propertyCount === "number" && quiz.propertyCount > 0
          ? Math.min(quiz.propertyCount, 20)
          : 1;
      setPropertyCount(nextCount);
      setOwners(Array.from({ length: nextCount }, () => emptyOwnerDraft()));
      setProperties(Array.from({ length: nextCount }, () => emptyPropertyDraft()));
    } catch {
      // ignore invalid session payload
    }
  }, []);

  function patch<K extends keyof OrderDocumentFormInput>(
    key: K,
    value: OrderDocumentFormInput[K]
  ) {
    const nextValue = (() => {
      if (typeof value !== "string") return value;
      if (key === "property_type") return value;
      if (key === "email") return normalizeLowercase(value) as OrderDocumentFormInput[K];
      return normalizeUppercase(value) as OrderDocumentFormInput[K];
    })();
    setForm((prev) => ({ ...prev, [key]: nextValue }));
  }

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

  function togglePlatform(id: "airbnb" | "booking" | "other" | "direct") {
    setForm((prev) => {
      const cur = prev.rental_platform ?? [];
      const has = cur.includes(id);
      const next = has ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...prev, rental_platform: next };
    });
  }

  async function downloadZip() {
    setError(null);
    setLoading(true);
    try {
      if (!consents.termsAccepted || !consents.digitalContentConsent) {
        throw new Error(
          "Zaakceptuj Regulamin, Polityke prywatnosci oraz zgode na natychmiastowe wykonanie umowy."
        );
      }

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
              email: form.email,
              sessionId,
            }),
          });
          if (!consentRes.ok) {
            const j = (await consentRes.json().catch(() => ({}))) as { error?: string };
            console.warn("[log-consent] pominięto zapis zgody:", j.error || consentRes.status);
            setConsentId(`local-${Date.now()}`);
          } else {
            const j = (await consentRes.json()) as { consentId: string };
            setConsentId(j.consentId);
          }
        } catch (consentError) {
          console.warn("[log-consent] błąd połączenia, kontynuuję bez zapisu:", consentError);
          setConsentId(`local-${Date.now()}`);
        }
      }

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
      const payload: OrderDocumentFormInput = {
        ...form,
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
        quiz_answers: {
          ...form.quiz_answers,
          owner_units_json: ownerUnitsJson,
        },
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Błąd ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `najembezkary_dokumenty.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się pobrać pliku.");
    } finally {
      setLoading(false);
    }
  }

  function validateStep(s: number): boolean {
    setError(null);
    if (s === 1) {
      const err = validateOwnersStep(owners);
      if (err) {
        setError(err);
        return false;
      }
      owners.forEach((_, i) => {
        const identityDoc = (owners[i]!.owner_identity_document ?? "")
          .trim()
          .toUpperCase()
          .replace(/\s+/g, "");
        patchOwner(i, "owner_identity_document", identityDoc);
      });
    }
    if (s === 2) {
      const err = validatePropertiesStep(properties);
      if (err) {
        setError(err);
        return false;
      }
      savePrepareDraft({ owners, properties });
    }
    if (s === 3) {
      if (form.rental_platform?.includes("other") && !otherPlatformName.trim()) {
        setError("Wpisz nazwę własnej platformy najmu.");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep(step)) return;
    if (step === STEPS - 1) {
      if (!consents.termsAccepted || !consents.digitalContentConsent) {
        setError(
          "Zaakceptuj Regulamin, Polityke prywatnosci oraz zgode na natychmiastowe wykonanie umowy."
        );
        return;
      }
    }
    setStep((x) => Math.min(STEPS, x + 1));
  }

  function back() {
    setError(null);
    setStep((x) => Math.max(1, x - 1));
  }

  const summaryLines = useMemo(() => {
    const plats = (form.rental_platform ?? [])
      .map((id) => {
        if (id === "other" && otherPlatformName.trim()) {
          return `Inna platforma: ${otherPlatformName.trim()}`;
        }
        return RENTAL_PLATFORM_LABELS[id] ?? id;
      })
      .join(", ");
    const ownersSummary = owners
      .map((owner, idx) => `${idx + 1}. ${owner.owner_name} (${owner.email})`)
      .join(" | ");
    const propertiesSummary = properties
      .map((property, idx) => `${idx + 1}. ${property.property_address}, ${property.property_city}`)
      .join(" | ");
    return [
      ["Liczba lokali", String(propertyCount)],
      ["Właściciele", ownersSummary || "—"],
      ["Lokale", propertiesSummary || "—"],
      ["Platformy / rok", `${plats || "—"} / rok: ${form.rental_since || "—"}`],
      ["Osoby w obiekcie (quiz)", Q3_LABELS[form.quiz_answers.q3] ?? form.quiz_answers.q3],
    ];
  }, [form, otherPlatformName, owners, properties, propertyCount]);

  return (
    <div className="wizard">
      <div className="wizard-progress" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <span
            key={i}
            className={`wizard-dot ${i + 1 <= step ? "wizard-dot--on" : ""}`}
          />
        ))}
        <span className="wizard-progress-label">
          Krok {step} z {STEPS}
        </span>
      </div>

      {error ? (
        <p className="wizard-error" role="alert">
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <OwnerDataStep
          owners={owners}
          patchOwner={patchOwner}
          copyOwnerFromFirst={copyOwnerFromFirst}
        />
      ) : null}

      {step === 2 ? (
        <PropertyDataStep
          properties={properties}
          patchProperty={patchProperty}
          copyPropertyFromFirst={copyPropertyFromFirst}
        />
      ) : null}

      {step === 3 ? (
        <section className="wizard-panel">
          <h2>Platformy rezerwacji i rok rozpoczęcia</h2>
          <p className="wizard-hint">
            Zaznacz kanały, na których publikujesz ofertę (możesz wybrać kilka).
          </p>
          <div className="check-grid">
            {PLATFORM_IDS.map((id) => (
              <label key={id} className="check">
                <input
                  type="checkbox"
                  checked={form.rental_platform?.includes(id) ?? false}
                  onChange={() => togglePlatform(id)}
                />
                <span>{RENTAL_PLATFORM_LABELS[id]}</span>
              </label>
            ))}
          </div>
          {form.rental_platform?.includes("other") ? (
            <label className="field field--wide">
              <span>Podaj nazwę własnej platformy najmu</span>
              <input
                value={otherPlatformName}
                onChange={(e) => setOtherPlatformName(normalizeUppercase(e.target.value))}
                placeholder="Np. NOCLEGI.PL"
              />
            </label>
          ) : null}
          <label className="field">
            <span>Rok rozpoczęcia wynajmu krótkoterminowego</span>
            <select
              value={form.rental_since ?? ""}
              onChange={(e) => patch("rental_since", e.target.value)}
            >
              <option value="">Wybierz rok</option>
              {RENTAL_SINCE_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="wizard-panel">
          <h2>Krótka ankieta</h2>
          <p className="wizard-hint">
            Przewidywana liczba osób jednocześnie przebywających w obiekcie (orientacyjnie):
          </p>
          <div className="radio-list">
            {Q3_KEYS.map((key) => (
              <label key={key} className="radio">
                <input
                  type="radio"
                  name="q3"
                  checked={form.quiz_answers.q3 === key}
                  onChange={() =>
                    setForm((p) => ({
                      ...p,
                      quiz_answers: { ...p.quiz_answers, q3: key },
                    }))
                  }
                />
                <span>{Q3_LABELS[key]}</span>
              </label>
            ))}
          </div>
          <p className="wizard-hint">
            Zaakceptuj klauzule wymagane do wygenerowania i pobrania dokumentów.
          </p>
          <OrderFormConsents onChange={setConsents} />
        </section>
      ) : null}

      {step === 5 ? (
        <section className="wizard-panel">
          <h2>Podsumowanie</h2>
          <dl className="summary">
            {summaryLines.map(([k, v]) => (
              <div key={k} className="summary-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className="btn-primary"
            disabled={loading}
            onClick={() => void downloadZip()}
          >
            {loading ? "Generowanie…" : "Pobierz"}
          </button>
        </section>
      ) : null}

      <div className="wizard-nav">
        {step > 1 && step < STEPS ? (
          <button type="button" className="btn-secondary" onClick={back}>
            Wstecz
          </button>
        ) : step === 1 ? (
          <button type="button" className="btn-secondary" onClick={() => router.push("/")}>
            Powrót
          </button>
        ) : (
          <span />
        )}
        {step < STEPS ? (
          <button type="button" className="btn-primary" onClick={next}>
            Dalej
          </button>
        ) : null}
      </div>
    </div>
  );
}
