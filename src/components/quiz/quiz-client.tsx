"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  QUIZ_STORAGE_KEY,
  type MunicipalityLite,
  type QuizState,
} from "@/lib/checkout-flow";

const initial: Omit<QuizState, "requiresRegistration"> = {
  propertyCount: 1,
  managementAuthorizationFileName: "",
  q1: "platform",
  q2City: "",
  q3: "up_to_4",
  q4: "owner",
  q5: "no_number",
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeUppercase(value: string): string {
  return value.toLocaleUpperCase("pl-PL");
}

const VOIVODESHIP_CITIES = new Set(
  [
    "Białystok",
    "Bydgoszcz",
    "Gdańsk",
    "Gorzów Wielkopolski",
    "Katowice",
    "Kielce",
    "Kraków",
    "Lublin",
    "Łódź",
    "Olsztyn",
    "Opole",
    "Poznań",
    "Rzeszów",
    "Szczecin",
    "Toruń",
    "Warszawa",
    "Wrocław",
    "Zielona Góra",
  ].map(normalizeText)
);

export function QuizClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [propertyCountOption, setPropertyCountOption] = useState<"1" | "2" | "3" | "custom">("1");
  const [propertyCountCustom, setPropertyCountCustom] = useState("");
  const [result, setResult] = useState<QuizState | null>(null);
  const [municipalities, setMunicipalities] = useState<MunicipalityLite[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [authorizationUploadStatus, setAuthorizationUploadStatus] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");
  const [authorizationUploadError, setAuthorizationUploadError] = useState<string | null>(null);

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
    const fuzzy = fuse.search(q).slice(0, 20).map((r) => r.item);
    if (fuzzy.length > 0) return fuzzy;

    const nq = normalizeText(q);
    return municipalities
      .filter((m) => {
        const hay = `${m.name} ${m.full_name} ${m.voivodeship}`;
        return normalizeText(hay).includes(nq);
      })
      .slice(0, 20);
  }, [form.q2City, fuse, municipalities]);

  const isVoivodeshipCity = useMemo(
    () => VOIVODESHIP_CITIES.has(normalizeText(form.q2City)),
    [form.q2City]
  );
  const requiresAuthorizationUpload = step === 5 && form.q4 === "manager";
  const canProceedFromCurrentStep =
    !requiresAuthorizationUpload || authorizationUploadStatus === "uploaded";

  function next() {
    setStep((s) => Math.min(6, s + 1));
  }

  useEffect(() => {
    if (step !== 3) return;
    if (municipalities.length > 0) return;
    let cancelled = false;

    (async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch("/api/municipalities/all");
        const json = (await res.json()) as { results?: MunicipalityLite[]; error?: string };
        if (!res.ok) throw new Error(json.error || "Błąd pobierania listy gmin");
        if (!cancelled) {
          setMunicipalities(json.results ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setSearchError(e instanceof Error ? e.message : "Błąd pobierania listy gmin");
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, municipalities.length]);
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function finish() {
    const requiresRegistration = form.q1 !== "long_term" && form.q5 !== "has_number";
    const customCount = Number(propertyCountCustom);
    const selectedCount =
      propertyCountOption === "custom" ? (Number.isFinite(customCount) && customCount > 0 ? customCount : 1) : Number(propertyCountOption);
    const payload: QuizState = { ...form, requiresRegistration };
    payload.propertyCount = selectedCount;
    setResult(payload);
    sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(payload));
  }

  async function searchMunicipalities(q: string) {
    const normalizedQuery = normalizeUppercase(q);
    setForm((p) => ({
      ...p,
      q2City: normalizedQuery,
      q2TerytCode: undefined,
      municipality: undefined,
    }));
    if (normalizedQuery.trim().length < 2) {
      return;
    }
    const hasFullMunicipalities = municipalities.length >= 2400;
    if (hasFullMunicipalities) {
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const rawQuery = normalizedQuery.trim();
      const res = await fetch(`/api/municipalities/search?q=${encodeURIComponent(rawQuery)}`);
      const json = (await res.json()) as { results?: MunicipalityLite[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Błąd wyszukiwania gmin");

      let results = json.results ?? [];

      // If API returns nothing for accented input, retry without diacritics.
      if (results.length === 0) {
        const fallbackQuery = normalizeText(rawQuery);
        if (fallbackQuery && fallbackQuery !== rawQuery.toLowerCase()) {
          const resFallback = await fetch(
            `/api/municipalities/search?q=${encodeURIComponent(fallbackQuery)}`
          );
          const jsonFallback = (await resFallback.json()) as {
            results?: MunicipalityLite[];
            error?: string;
          };
          if (resFallback.ok) {
            results = jsonFallback.results ?? [];
          }
        }
      }

      setMunicipalities(results);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Błąd wyszukiwania gmin");
      setMunicipalities([]);
    } finally {
      setSearching(false);
    }
  }

  function chooseMunicipality(m: MunicipalityLite) {
    setForm((p) => ({
      ...p,
      q2City: normalizeUppercase(m.name),
      q2TerytCode: m.teryt_code,
      municipality: m,
    }));
  }

  async function uploadAuthorizationFile(file: File) {
    setAuthorizationUploadStatus("uploading");
    setAuthorizationUploadError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("city", form.q2City || "");
      data.append("propertyCount", String(form.propertyCount ?? ""));

      const res = await fetch("/api/authorizations/upload", {
        method: "POST",
        body: data,
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        warning?: string;
        sent?: boolean;
      };

      if (!res.ok) {
        throw new Error(json.error || "Nie udało się wysłać pliku pełnomocnictwa.");
      }

      setAuthorizationUploadStatus("uploaded");
      setForm((p) => ({ ...p, managementAuthorizationFileName: file.name }));
      if (json.warning) {
        setAuthorizationUploadError(json.warning);
      }
    } catch (e) {
      setAuthorizationUploadStatus("error");
      setAuthorizationUploadError(
        e instanceof Error ? e.message : "Nie udało się wysłać pliku pełnomocnictwa."
      );
    }
  }

  if (result) {
    return (
      <main className="page-shell">
        <h1 className="page-title">
          {result.requiresRegistration
            ? "Twój lokal wymaga rejestracji"
            : "Prawdopodobnie nie musisz się rejestrować"}
        </h1>
        <p className="page-intro">
          {result.requiresRegistration
            ? "Przejdź dalej i uzupełnij formularz danych do dokumentów."
            : "Możesz mimo to pobrać pakiet dokumentów dla bezpieczeństwa."}
        </p>
        <button className="btn-primary" onClick={() => router.push("/dane")}>
          Przejdź do formularza
        </button>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <h1 className="page-title">KROK {step}</h1>

      {step === 1 && (
        <div className="field">
          <span>Ile posiadasz lokali?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "1"}
                onChange={() => {
                  setPropertyCountOption("1");
                  setForm((p) => ({ ...p, propertyCount: 1 }));
                }}
              />
              <span>1 lokal</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "2"}
                onChange={() => {
                  setPropertyCountOption("2");
                  setForm((p) => ({ ...p, propertyCount: 2 }));
                }}
              />
              <span>2 lokale</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "3"}
                onChange={() => {
                  setPropertyCountOption("3");
                  setForm((p) => ({ ...p, propertyCount: 3 }));
                }}
              />
              <span>3 lokale</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="property-count"
                checked={propertyCountOption === "custom"}
                onChange={() => setPropertyCountOption("custom")}
              />
              <span>Podaj liczbę</span>
            </label>
          </div>
          {propertyCountOption === "custom" ? (
            <input
              type="number"
              min={1}
              step={1}
              value={propertyCountCustom}
              onChange={(e) => {
                const raw = e.target.value;
                setPropertyCountCustom(raw);
                const n = Number(raw);
                if (Number.isFinite(n) && n > 0) {
                  setForm((p) => ({ ...p, propertyCount: n }));
                }
              }}
              placeholder="Podaj liczbę lokali"
            />
          ) : null}
        </div>
      )}
      {step === 2 && (
        <div className="field">
          <span>Czy wynajmujesz krótkoterminowo poniżej 30 dni?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="rent-type"
                checked={form.q1 === "platform"}
                onChange={() => setForm((p) => ({ ...p, q1: "platform" }))}
              />
              <span>Tak, przez platformy</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="rent-type"
                checked={form.q1 === "direct"}
                onChange={() => setForm((p) => ({ ...p, q1: "direct" }))}
              />
              <span>Tak, bezpośrednio</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="rent-type"
                checked={form.q1 === "long_term"}
                onChange={() => setForm((p) => ({ ...p, q1: "long_term" }))}
              />
              <span>Nie, długoterminowo</span>
            </label>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <label className="field">
          <span>W jakim mieście jest Twój lokal?</span>
            <input
              value={form.q2City}
              onChange={(e) => void searchMunicipalities(e.target.value)}
              placeholder="Wpisz nazwę gminy lub dzielnicy, np. Warszawa Ursynów"
            />
          </label>
          {searching ? <p className="wizard-hint">Szukam gmin...</p> : null}
          {searchError ? <p className="wizard-error">{searchError}</p> : null}
          {suggestions.length > 0 && !form.q2TerytCode ? (
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
          {form.q2TerytCode && isVoivodeshipCity ? (
            <p className="wizard-hint">
              Reguła dla miast wojewódzkich: właściwe są urzędy gminy (dzielnic). Upewnij się, że
              wybierasz właściwy urząd dla dzielnicy lokalu.
            </p>
          ) : null}
        </div>
      )}
      {step === 4 && (
        <div className="field">
          <span>Ile osób może przebywać jednocześnie?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="capacity"
                checked={form.q3 === "up_to_4"}
                onChange={() => setForm((p) => ({ ...p, q3: "up_to_4" }))}
              />
              <span>Do 4 osób</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="capacity"
                checked={form.q3 === "5_to_10"}
                onChange={() => setForm((p) => ({ ...p, q3: "5_to_10" }))}
              />
              <span>5-10 osób</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="capacity"
                checked={form.q3 === "above_10"}
                onChange={() => setForm((p) => ({ ...p, q3: "above_10" }))}
              />
              <span>Powyżej 10 osób</span>
            </label>
          </div>
        </div>
      )}
      {step === 5 && (
        <div className="field">
          <span>Czy jesteś właścicielem lokalu?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="owner-type"
                checked={form.q4 === "owner"}
                onChange={() => setForm((p) => ({ ...p, q4: "owner" }))}
              />
              <span>Tak, jestem właścicielem</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="owner-type"
                checked={form.q4 === "subtenant"}
                onChange={() => setForm((p) => ({ ...p, q4: "subtenant" }))}
              />
              <span>Podnajemca / zarządca</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="owner-type"
                checked={form.q4 === "manager"}
                onChange={() => setForm((p) => ({ ...p, q4: "manager" }))}
              />
              <span>Zarządzam lokalami innych</span>
            </label>
          </div>
          {form.q4 === "manager" ? (
            <label className="field">
              <span>Dodaj plik pełnomocnictwa/pełnomocnictw (PDF/JPG/PNG)</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void uploadAuthorizationFile(file);
                }}
              />
              {authorizationUploadStatus === "uploading" ? (
                <p className="wizard-hint">Wysyłam plik na adres kontakt@najembezkary.pl...</p>
              ) : null}
              {authorizationUploadStatus === "uploaded" ? (
                <p className="wizard-hint">
                  Plik został automatycznie przesłany: {form.managementAuthorizationFileName}
                </p>
              ) : null}
              {authorizationUploadStatus === "uploaded" && authorizationUploadError ? (
                <p className="wizard-hint">{authorizationUploadError}</p>
              ) : null}
              {authorizationUploadStatus === "error" && authorizationUploadError ? (
                <p className="wizard-error">{authorizationUploadError}</p>
              ) : null}
            </label>
          ) : null}
        </div>
      )}
      {step === 6 && (
        <div className="field">
          <span>Czy lokal ma już numer rejestracyjny?</span>
          <div className="option-list">
            <label className="option-item">
              <input
                type="radio"
                name="has-number"
                checked={form.q5 === "no_number"}
                onChange={() => setForm((p) => ({ ...p, q5: "no_number" }))}
              />
              <span>Nie</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="has-number"
                checked={form.q5 === "unknown"}
                onChange={() => setForm((p) => ({ ...p, q5: "unknown" }))}
              />
              <span>Nie wiem</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name="has-number"
                checked={form.q5 === "has_number"}
                onChange={() => setForm((p) => ({ ...p, q5: "has_number" }))}
              />
              <span>Tak, już mam</span>
            </label>
          </div>
        </div>
      )}

      <div className="wizard-nav">
        {step > 1 ? (
          <button className="btn-secondary" onClick={back}>
            Wstecz
          </button>
        ) : (
          <span />
        )}
        {step < 6 ? (
          <button className="btn-primary" onClick={next} disabled={!canProceedFromCurrentStep}>
            Dalej
          </button>
        ) : (
          <button className="btn-primary" onClick={finish}>
            Zobacz wynik
          </button>
        )}
      </div>
      {requiresAuthorizationUpload && !canProceedFromCurrentStep ? (
        <p className="wizard-error">
          Aby przejść dalej, dodaj i prześlij pełnomocnictwo (PDF/JPG/PNG).
        </p>
      ) : null}
    </main>
  );
}
