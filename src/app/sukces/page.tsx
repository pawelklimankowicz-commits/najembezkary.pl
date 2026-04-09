"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  PREPARED_ORDER_STORAGE_KEY,
  QUIZ_STORAGE_KEY,
  type MunicipalityLite,
  type QuizState,
} from "@/lib/checkout-flow";
import type { OrderDocumentFormInput } from "@/lib/order-input-schema";

export default function SukcesPage() {
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [orderPayload, setOrderPayload] = useState<OrderDocumentFormInput | null>(null);
  const [resolvedMunicipality, setResolvedMunicipality] = useState<MunicipalityLite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedOfficePhone, setResolvedOfficePhone] = useState<string | null>(null);
  const [resolvedOfficeAddress, setResolvedOfficeAddress] = useState<string | null>(null);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [paymentPaid, setPaymentPaid] = useState(false);
  const [paymentStatusError, setPaymentStatusError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as QuizState;
    setQuiz(parsed);
    if (parsed.municipality) {
      setResolvedMunicipality(parsed.municipality);
    }
  }, []);
  useEffect(() => {
    const raw = sessionStorage.getItem(PREPARED_ORDER_STORAGE_KEY);
    if (!raw) return;
    setOrderPayload(JSON.parse(raw) as OrderDocumentFormInput);
  }, []);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setPaymentChecked(true);
      setPaymentPaid(false);
      setPaymentStatusError("Brak identyfikatora sesji płatności.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const payload = (await res.json().catch(() => ({}))) as { paid?: boolean; error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setPaymentPaid(false);
          setPaymentStatusError(payload.error || "Nie udało się zweryfikować płatności.");
          return;
        }
        setPaymentPaid(Boolean(payload.paid));
        if (!payload.paid) {
          setPaymentStatusError("Płatność nie została potwierdzona.");
        }
      } catch {
        if (!cancelled) {
          setPaymentPaid(false);
          setPaymentStatusError("Nie udało się zweryfikować płatności.");
        }
      } finally {
        if (!cancelled) {
          setPaymentChecked(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resolvedMunicipality) return;
    const cityQuery = (quiz?.q2City || orderPayload?.property_city || "").trim();
    if (!cityQuery) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/municipalities/search?q=${encodeURIComponent(cityQuery)}`);
        if (!res.ok) return;
        const payload = (await res.json().catch(() => ({}))) as { results?: MunicipalityLite[] };
        const best =
          payload.results?.find((m) => m.name.toUpperCase() === cityQuery.toUpperCase()) ??
          payload.results?.[0];
        if (!cancelled && best) {
          setResolvedMunicipality(best);
        }
      } catch {
        // Keep UI fallback text if lookup fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quiz, orderPayload, resolvedMunicipality]);

  useEffect(() => {
    const office = resolvedMunicipality;
    if (!office) return;
    if (office.office_address?.trim()) {
      setResolvedOfficeAddress(office.office_address);
    }
    if (office.office_phone?.trim()) {
      setResolvedOfficePhone(office.office_phone);
    }

    let isCancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/office-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            officeName: office.office_name,
            officeAddress: office.office_address,
            city: office.name,
          }),
        });
        if (!res.ok) return;
        const payload = (await res.json().catch(() => ({}))) as {
          phone?: string | null;
          address?: string | null;
        };
        if (!isCancelled && payload.phone) {
          setResolvedOfficePhone(payload.phone);
        }
        if (!isCancelled && payload.address) {
          setResolvedOfficeAddress(payload.address);
        }
      } catch {
        // Fallback to "brak" in UI when lookup fails.
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [resolvedMunicipality]);

  async function downloadDocuments() {
    if (!orderPayload) {
      setError("Brak zapisanych danych do wygenerowania dokumentów.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Błąd ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "najembezkary_dokumenty.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się pobrać dokumentów.");
    } finally {
      setLoading(false);
    }
  }

  const office = resolvedMunicipality;

  return (
    <main className="page-shell">
      <div className="success-icon">
        <span>✓</span>
      </div>
      <h1 className="page-title">Płatność zakończona pomyślnie.</h1>
      <p className="page-intro">
        <strong>Możesz teraz pobrać paczkę dokumentów ZIP i złożyć dokumenty we właściwym urzędzie gminy.</strong>
      </p>
      {paymentChecked && paymentPaid ? (
        <p>
          <button type="button" className="btn-success" onClick={() => void downloadDocuments()} disabled={loading}>
            {loading ? "Generowanie…" : "Pobierz dokumenty"}
          </button>
        </p>
      ) : (
        <p className="wizard-hint">Trwa weryfikacja płatności...</p>
      )}
      {paymentChecked && !paymentPaid ? (
        <p className="wizard-error">
          {paymentStatusError || "Płatność nie została potwierdzona."}{" "}
          <Link href="/platnosc">Wróć do płatności</Link>
        </p>
      ) : null}
      {error ? <p className="wizard-error">{error}</p> : null}
      {!orderPayload ? (
        <p className="wizard-hint">
          Brak zapisanych danych do pobrania. Wróć do formularza przygotowania dokumentów.
          <br />
          <Link href="/przygotuj">Przejdź do kreatora</Link>
        </p>
      ) : null}
      {office ? (
        <section className="landing-section">
          <h2>Gdzie złożyć dokumenty</h2>
          <p>
            <strong>{office.office_name}</strong>
            <br />
            {office.office_bip_url ? (
              <>
                Strona BIP:{" "}
                <a href={office.office_bip_url} target="_blank" rel="noreferrer">
                  {office.office_bip_url}
                </a>
                <br />
              </>
            ) : null}
            {resolvedOfficeAddress ? (
              <>
                {resolvedOfficeAddress}
                <br />
              </>
            ) : null}
          </p>
          <p>
            Sposoby złożenia:
            <br />
            {office.accepts_in_person ? "✓ Osobiście" : "— Osobiście niedostępne"}
            <br />
            {office.accepts_epuap ? "✓ Przez ePUAP" : "— ePUAP niedostępny"}
            <br />
            {office.accepts_mail ? "✓ Poczta" : "— Poczta niedostępna"}
          </p>
          {resolvedOfficePhone ? <p>Telefon: {resolvedOfficePhone}</p> : null}
          <p>
            <strong>Termin złożenia dokumentów:</strong> do 20 maja 2026
          </p>
        </section>
      ) : null}
    </main>
  );
}
