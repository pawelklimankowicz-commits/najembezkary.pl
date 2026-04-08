"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { QUIZ_STORAGE_KEY, type QuizState } from "@/lib/checkout-flow";

export default function SukcesPage() {
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return;
    setQuiz(JSON.parse(raw) as QuizState);
  }, []);

  const office = quiz?.municipality;

  return (
    <main className="page-shell">
      <div className="success-icon">
        <span>✓</span>
      </div>
      <h1 className="page-title">Dziekujemy! Twoje dokumenty sa gotowe.</h1>
      <p className="page-intro">
        Twoja paczka dokumentow zostala przygotowana. Pobierz plik ZIP i zloz dokumenty we wlasciwym
        urzedzie gminy.
      </p>
      <p>
        <Link href="/przygotuj" className="btn-success">
          Pobierz pakiet dokumentow (ZIP)
        </Link>
      </p>
      {office ? (
        <section className="landing-section">
          <h2>Gdzie zlozyc dokumenty</h2>
          <p>
            <strong>{office.office_name}</strong>
            <br />
            {office.office_address || "Adres urzedu uzupelnimy po wzbogaceniu bazy."}
          </p>
          <p>
            Sposoby zlozenia:
            <br />
            {office.accepts_in_person ? "✓ Osobiscie" : "— Osobiscie niedostepne"}
            <br />
            {office.accepts_epuap ? "✓ Przez ePUAP" : "— ePUAP niedostepny"}
            <br />
            {office.accepts_mail ? "✓ Poczta" : "— Poczta niedostepna"}
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
