"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DATA_STORAGE_KEY, QUIZ_STORAGE_KEY, type OwnerDataState, type QuizState } from "@/lib/checkout-flow";

export function PaymentSummary() {
  const router = useRouter();
  const [owner, setOwner] = useState<OwnerDataState | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  useEffect(() => {
    const o = sessionStorage.getItem(DATA_STORAGE_KEY);
    const q = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (o) setOwner(JSON.parse(o) as OwnerDataState);
    if (q) setQuiz(JSON.parse(q) as QuizState);
  }, []);

  return (
    <div className="wizard">
      <p className="page-intro">Pakiet dokumentów najembezkary.pl - 99,00 zł brutto</p>
      <ul>
        <li>Właściciel: {owner?.fullName ?? "-"}</li>
        <li>Lokal: {owner?.propertyAddress ?? "-"}</li>
        <li>Email: {owner?.email ?? "-"}</li>
        <li>Status ankiety: {quiz?.requiresRegistration ? "Wymaga rejestracji" : "Do weryfikacji"}</li>
      </ul>
      <div className="wizard-nav">
        <button className="btn-secondary" onClick={() => router.push("/dane")}>
          Wróć do danych
        </button>
        <button className="btn-primary" onClick={() => router.push("/sukces")}>
          Zapłać 99 zł i pobierz dokumenty
        </button>
      </div>
    </div>
  );
}
