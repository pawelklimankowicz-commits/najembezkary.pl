"use client";

import { useMemo, useState } from "react";

import { RENTAL_PLATFORM_LABELS } from "@/lib/owner-form-schema";
import OrderFormConsents, {
  type ConsentState,
} from "@/components/OrderFormConsents";
import type { OrderDocumentFormInput } from "@/lib/order-input-schema";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  mieszkanie: "Mieszkanie",
  dom: "Dom",
  apartament: "Apartament",
  pokoj: "Pokój",
};

const Q3_KEYS = ["up_to_4", "5_to_10", "above_10"] as const;

const Q3_LABELS: Record<(typeof Q3_KEYS)[number], string> = {
  up_to_4: "do 4 osób jednocześnie",
  "5_to_10": "5–10 osób jednocześnie",
  above_10: "powyżej 10 osób jednocześnie",
};

const PLATFORM_IDS = ["airbnb", "booking", "other", "direct"] as const;

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
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrderDocumentFormInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consents, setConsents] = useState<ConsentState>({
    termsAccepted: false,
    digitalContentConsent: false,
    analyticsConsent: false,
    marketingConsent: false,
  });
  const [consentId, setConsentId] = useState<string | null>(null);

  function patch<K extends keyof OrderDocumentFormInput>(
    key: K,
    value: OrderDocumentFormInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          throw new Error(j.error || "Nie mozna zapisac zgod. Sprobuj ponownie.");
        }
        const j = (await consentRes.json()) as { consentId: string };
        setConsentId(j.consentId);
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      if (form.owner_name.trim().length < 2) {
        setError("Podaj imię i nazwisko.");
        return false;
      }
      if (!form.email.includes("@")) {
        setError("Podaj prawidłowy e-mail.");
        return false;
      }
      if (form.owner_phone.trim().length < 5) {
        setError("Podaj numer telefonu.");
        return false;
      }
      if (!form.owner_city.trim() || !form.owner_address.trim() || !form.owner_zip.trim()) {
        setError("Uzupełnij adres korespondencyjny.");
        return false;
      }
    }
    if (s === 2) {
      if (!form.property_address.trim() || !form.property_city.trim()) {
        setError("Uzupełnij adres obiektu.");
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
    const f = form;
    const plats = (f.rental_platform ?? [])
      .map((id) => RENTAL_PLATFORM_LABELS[id] ?? id)
      .join(", ");
    return [
      ["Właściciel", `${f.owner_name}, ${f.owner_address}, ${f.owner_zip} ${f.owner_city}`],
      ["Kontakt", `${f.email}, tel. ${f.owner_phone}`],
      ["PESEL / dowód", `${f.owner_pesel || "—"} / ${f.owner_identity_document || "—"}`],
      ["Obiekt", `${f.property_address}, ${f.property_zip || ""} ${f.property_city}`.trim()],
      [
        "Parametry",
        `${PROPERTY_TYPE_LABELS[f.property_type] ?? f.property_type}, pow. ${f.property_area ?? "—"} m², piętro ${f.property_floor ?? "—"}`,
      ],
      ["Platformy / rok", `${plats || "—"} / rok: ${f.rental_since || "—"}`],
      ["Osoby w obiekcie (quiz)", Q3_LABELS[f.quiz_answers.q3] ?? f.quiz_answers.q3],
    ];
  }, [form]);

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
        <section className="wizard-panel">
          <h2>Dane właściciela i kontakt</h2>
          <div className="field-grid">
            <label className="field">
              <span>Imię i nazwisko</span>
              <input
                value={form.owner_name}
                onChange={(e) => patch("owner_name", e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => patch("email", e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="field">
              <span>Telefon</span>
              <input
                value={form.owner_phone}
                onChange={(e) => patch("owner_phone", e.target.value)}
                autoComplete="tel"
              />
            </label>
            <label className="field">
              <span>Ulica, numer (korespondencja)</span>
              <input
                value={form.owner_address}
                onChange={(e) => patch("owner_address", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Kod pocztowy</span>
              <input
                value={form.owner_zip}
                onChange={(e) => patch("owner_zip", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Miejscowość</span>
              <input
                value={form.owner_city}
                onChange={(e) => patch("owner_city", e.target.value)}
              />
            </label>
            <label className="field">
              <span>PESEL (opcjonalnie)</span>
              <input
                value={form.owner_pesel ?? ""}
                onChange={(e) => patch("owner_pesel", e.target.value)}
              />
            </label>
            <label className="field field--wide">
              <span>Dowód osobisty / paszport — seria i numer (opcjonalnie)</span>
              <input
                value={form.owner_identity_document ?? ""}
                onChange={(e) => patch("owner_identity_document", e.target.value)}
              />
            </label>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="wizard-panel">
          <h2>Obiekt do rejestracji</h2>
          <div className="field-grid">
            <label className="field field--wide">
              <span>Adres obiektu (ulica, numer)</span>
              <input
                value={form.property_address}
                onChange={(e) => patch("property_address", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Kod pocztowy</span>
              <input
                value={form.property_zip ?? ""}
                onChange={(e) => patch("property_zip", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Miejscowość</span>
              <input
                value={form.property_city}
                onChange={(e) => patch("property_city", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Rodzaj lokalu</span>
              <select
                value={form.property_type}
                onChange={(e) =>
                  patch(
                    "property_type",
                    e.target.value as OrderDocumentFormInput["property_type"]
                  )
                }
              >
                {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Powierzchnia użytkowa (m²)</span>
              <input
                type="number"
                min={1}
                step={0.1}
                value={form.property_area ?? ""}
                onChange={(e) =>
                  patch(
                    "property_area",
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </label>
            <label className="field">
              <span>Piętro (opcjonalnie)</span>
              <input
                type="number"
                step={1}
                value={form.property_floor ?? ""}
                onChange={(e) =>
                  patch(
                    "property_floor",
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
            </label>
          </div>
        </section>
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
          <label className="field">
            <span>Rok rozpoczęcia wynajmu krótkoterminowego (np. 2024)</span>
            <input
              value={form.rental_since ?? ""}
              onChange={(e) => patch("rental_since", e.target.value)}
              placeholder="np. 2024"
            />
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
          <p className="wizard-hint">
            Po kliknięciu pobierzesz archiwum ZIP z sześcioma dokumentami PDF (wniosek,
            oświadczenie, regulamin, wzór umowy, checklista, instrukcja).
          </p>
          <OrderFormConsents onChange={setConsents} />
          <button
            type="button"
            className="btn-primary"
            disabled={loading}
            onClick={() => void downloadZip()}
          >
            {loading ? "Generowanie…" : "Pobierz paczkę ZIP"}
          </button>
        </section>
      ) : null}

      <div className="wizard-nav">
        {step > 1 ? (
          <button type="button" className="btn-secondary" onClick={back}>
            Wstecz
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
