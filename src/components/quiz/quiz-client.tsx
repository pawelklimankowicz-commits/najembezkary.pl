"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { QUIZ_STORAGE_KEY, type QuizState } from "@/lib/checkout-flow";

const initial: Omit<QuizState, "requiresRegistration"> = {
  q1: "platform",
  q2City: "",
  q3: "up_to_4",
  q4: "owner",
  q5: "no_number",
};

export function QuizClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState<QuizState | null>(null);

  function next() {
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function finish() {
    const requiresRegistration = form.q1 !== "long_term" && form.q5 !== "has_number";
    const payload: QuizState = { ...form, requiresRegistration };
    setResult(payload);
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
  }

  if (result) {
    return (
      <main className="page-shell">
        <h1 className="page-title">
          {result.requiresRegistration
            ? "Twoj lokal wymaga rejestracji"
            : "Prawdopodobnie nie musisz sie rejestrowac"}
        </h1>
        <p className="page-intro">
          {result.requiresRegistration
            ? "Przejdz dalej i uzupelnij formularz danych do dokumentow."
            : "Mozesz mimo to pobrac pakiet dokumentow dla bezpieczenstwa."}
        </p>
        <button className="btn-primary" onClick={() => router.push("/dane")}>
          Przejdz do formularza
        </button>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <h1 className="page-title">Krok 1 z 3 - Sprawdz obowiazek</h1>

      {step === 1 && (
        <label className="field">
          <span>Czy wynajmujesz krotkoterminowo ponizej 30 dni?</span>
          <select
            value={form.q1}
            onChange={(e) => setForm((p) => ({ ...p, q1: e.target.value as QuizState["q1"] }))}
          >
            <option value="platform">Tak, przez platformy</option>
            <option value="direct">Tak, bezposrednio</option>
            <option value="long_term">Nie, dlugoterminowo</option>
          </select>
        </label>
      )}
      {step === 2 && (
        <label className="field">
          <span>W jakim miescie jest Twoj lokal?</span>
          <input
            value={form.q2City}
            onChange={(e) => setForm((p) => ({ ...p, q2City: e.target.value }))}
          />
        </label>
      )}
      {step === 3 && (
        <label className="field">
          <span>Ile osob moze przebywac jednoczesnie?</span>
          <select
            value={form.q3}
            onChange={(e) => setForm((p) => ({ ...p, q3: e.target.value as QuizState["q3"] }))}
          >
            <option value="up_to_4">Do 4 osob</option>
            <option value="5_to_10">5-10 osob</option>
            <option value="above_10">Powyzej 10 osob</option>
          </select>
        </label>
      )}
      {step === 4 && (
        <label className="field">
          <span>Czy jestes wlascicielem lokalu?</span>
          <select
            value={form.q4}
            onChange={(e) => setForm((p) => ({ ...p, q4: e.target.value as QuizState["q4"] }))}
          >
            <option value="owner">Tak, jestem wlascicielem</option>
            <option value="subtenant">Podnajemca / zarzadca</option>
            <option value="manager">Zarzadzam lokalami innych</option>
          </select>
        </label>
      )}
      {step === 5 && (
        <label className="field">
          <span>Czy lokal ma juz numer rejestracyjny?</span>
          <select
            value={form.q5}
            onChange={(e) => setForm((p) => ({ ...p, q5: e.target.value as QuizState["q5"] }))}
          >
            <option value="no_number">Nie</option>
            <option value="unknown">Nie wiem</option>
            <option value="has_number">Tak, juz mam</option>
          </select>
        </label>
      )}

      <div className="wizard-nav">
        {step > 1 ? (
          <button className="btn-secondary" onClick={back}>
            Wstecz
          </button>
        ) : (
          <span />
        )}
        {step < 5 ? (
          <button className="btn-primary" onClick={next}>
            Dalej
          </button>
        ) : (
          <button className="btn-primary" onClick={finish}>
            Zobacz wynik
          </button>
        )}
      </div>
    </main>
  );
}
