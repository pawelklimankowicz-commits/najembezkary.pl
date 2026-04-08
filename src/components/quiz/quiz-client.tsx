"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  QUIZ_STORAGE_KEY,
  type MunicipalityLite,
  type QuizState,
} from "@/lib/checkout-flow";

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
  const [municipalities, setMunicipalities] = useState<MunicipalityLite[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

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
    return fuse.search(q).slice(0, 8).map((r) => r.item);
  }, [form.q2City, fuse]);

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

  async function searchMunicipalities(q: string) {
    setForm((p) => ({ ...p, q2City: q, q2TerytCode: undefined, municipality: undefined }));
    if (q.trim().length < 2) {
      setMunicipalities([]);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/municipalities/search?q=${encodeURIComponent(q.trim())}`);
      const json = (await res.json()) as { results?: MunicipalityLite[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Blad wyszukiwania gmin");
      setMunicipalities(json.results ?? []);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Blad wyszukiwania gmin");
      setMunicipalities([]);
    } finally {
      setSearching(false);
    }
  }

  function chooseMunicipality(m: MunicipalityLite) {
    setForm((p) => ({
      ...p,
      q2City: m.name,
      q2TerytCode: m.teryt_code,
      municipality: m,
    }));
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
        <div>
          <label className="field">
            <span>W jakim miescie jest Twoj lokal?</span>
            <input
              value={form.q2City}
              onChange={(e) => void searchMunicipalities(e.target.value)}
              placeholder="Wpisz nazwe gminy, np. Krakow"
            />
          </label>
          {searching ? <p className="wizard-hint">Szukam gmin...</p> : null}
          {searchError ? <p className="wizard-error">{searchError}</p> : null}
          {suggestions.length > 0 ? (
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
          {form.q2TerytCode ? (
            <p className="wizard-hint">Wybrano gmine TERYT: {form.q2TerytCode}</p>
          ) : null}
        </div>
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
