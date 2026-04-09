"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  PREPARED_ORDER_STORAGE_KEY,
  QUIZ_STORAGE_KEY,
  type QuizState,
} from "@/lib/checkout-flow";
import type { OrderDocumentFormInput } from "@/lib/order-input-schema";

export default function SukcesPage() {
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [orderPayload, setOrderPayload] = useState<OrderDocumentFormInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return;
    setQuiz(JSON.parse(raw) as QuizState);
  }, []);
  useEffect(() => {
    const raw = sessionStorage.getItem(PREPARED_ORDER_STORAGE_KEY);
    if (!raw) return;
    setOrderPayload(JSON.parse(raw) as OrderDocumentFormInput);
  }, []);

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

  const office = quiz?.municipality;

  return (
    <main className="page-shell">
      <div className="success-icon">
        <span>✓</span>
      </div>
      <h1 className="page-title">Płatność zakończona pomyślnie.</h1>
      <p className="page-intro">
        Możesz teraz pobrać paczkę dokumentów ZIP i złożyć dokumenty we właściwym urzędzie gminy.
      </p>
      <p>
        <button type="button" className="btn-success" onClick={() => void downloadDocuments()} disabled={loading}>
          {loading ? "Generowanie…" : "Pobierz dokumenty"}
        </button>
      </p>
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
            {office.office_address || "Adres urzędu uzupełnimy po wzbogaceniu bazy."}
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
          <p>
            Strona BIP:{" "}
            {office.office_bip_url ? (
              <a href={office.office_bip_url} target="_blank" rel="noreferrer">
                {office.office_bip_url}
              </a>
            ) : (
              "brak"
            )}
            <br />
            Telefon: {office.office_phone || "brak"}
          </p>
          <p>
            <strong>Termin:</strong> do 20 maja 2026
          </p>
        </section>
      ) : null}
    </main>
  );
}
