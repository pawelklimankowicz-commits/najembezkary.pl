# Klauzule zgód RODO — formularz zamówienia najembezkary.pl

---

## CHECKBOX 1 — Obowiązkowy (zgoda na wykonanie umowy + akceptacja regulaminu)

**Oznaczenie:** ☐ *(pole obowiązkowe — bez zaznaczenia zamówienie jest niemożliwe)*

**Treść checkboxa:**

> Zapoznałem/am się z [Regulaminem serwisu najembezkary.pl](/regulamin) oraz [Polityką prywatności](/polityka-prywatnosci) i akceptuję ich treść. Wyrażam zgodę na przetwarzanie moich danych osobowych przez Administratora w celu realizacji zamówienia i dostarczenia Pakietu dokumentów, na zasadach opisanych w [§4 Polityki prywatności](/polityka-prywatnosci#cele-i-podstawy-prawne) (art. 6 ust. 1 lit. b RODO — wykonanie umowy).

**Uwaga implementacyjna:** To checkbox obowiązkowy. Podstawa prawna przetwarzania to art. 6 ust. 1 lit. b RODO (wykonanie umowy) — zgoda nie jest tu wymagana przez RODO, ale akceptacja regulaminu jest warunkiem zawarcia umowy.

---

## CHECKBOX 2 — Obowiązkowy (zgoda na natychmiastowe wykonanie umowy + utrata prawa odstąpienia)

**Oznaczenie:** ☐ *(pole obowiązkowe — wymóg art. 38 pkt 13 ustawy o prawach konsumenta)*

**Treść checkboxa:**

> Wyrażam wyraźną zgodę na natychmiastowe przystąpienie do realizacji umowy o dostarczenie treści cyfrowych (wygenerowanie i udostępnienie Pakietu dokumentów) przed upływem 14-dniowego terminu do odstąpienia od umowy. Przyjmuję do wiadomości, że z chwilą udostępnienia mi Pakietu do pobrania **utracę prawo do odstąpienia od umowy**, zgodnie z art. 38 pkt 13 ustawy z dnia 30 maja 2014 r. o prawach konsumenta.

**Uwaga implementacyjna:** Ten checkbox jest kluczowy prawnie. Bez niego Konsument zachowuje 14-dniowe prawo odstąpienia. Musi być oddzielny od checkboxa nr 1.

---

## CHECKBOX 3 — Opcjonalny (cookies analityczne i marketingowe)

**Oznaczenie:** ☐ *(pole nieobowiązkowe)*

**Treść checkboxa:**

> Wyrażam zgodę na stosowanie przez serwis najembezkary.pl plików cookies analitycznych i marketingowych, służących do analizy sposobu korzystania z Serwisu oraz ewentualnego dostosowania treści marketingowych. Szczegółowe informacje znajdują się w [§10 Polityki prywatności](/polityka-prywatnosci#pliki-cookies). Zgodę mogę wycofać w każdym czasie poprzez zmianę ustawień przeglądarki lub kontakt na adres kontakt@najembezkary.pl.

**Uwaga implementacyjna:** Opcjonalny. Podstawa prawna: art. 6 ust. 1 lit. a RODO. Jeśli na starcie nie używasz cookies analitycznych ani marketingowych — możesz ten checkbox pominąć lub ukryć.

---

## CHECKBOX 4 — Opcjonalny (marketing emailowy)

**Oznaczenie:** ☐ *(pole nieobowiązkowe)*

**Treść checkboxa:**

> Wyrażam zgodę na przesyłanie mi przez Administratora serwisu najembezkary.pl informacji handlowych drogą elektroniczną (newsletter, aktualizacje dotyczące przepisów o najmie krótkoterminowym) na podany przeze mnie adres e-mail, zgodnie z art. 10 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną. Zgodę mogę wycofać w każdym czasie, klikając link rezygnacji w każdej wiadomości lub pisząc na adres kontakt@najembezkary.pl.

**Uwaga implementacyjna:** Opcjonalny. Wymagany przez ustawę o świadczeniu usług drogą elektroniczną do wysyłki informacji handlowych. Niezależny od zgody RODO.

---

## KLAUZULA INFORMACYJNA — wyświetlana nad checkboxami (skrócona)

Wyświetl tę klauzulę bezpośrednio nad checkboxami, małą czcionką (np. 12px):

---

**Klauzula informacyjna RODO**

Administratorem Pani/Pana danych osobowych jest właściciel serwisu najembezkary.pl (kontakt: kontakt@najembezkary.pl). Dane podane w formularzu będą przetwarzane w celu realizacji zamówienia i dostarczenia Pakietu dokumentów (art. 6 ust. 1 lit. b RODO), wypełnienia obowiązków prawnych (art. 6 ust. 1 lit. c RODO) oraz w celach wynikających z prawnie uzasadnionych interesów Administratora (art. 6 ust. 1 lit. f RODO), w szczególności zapewnienia bezpieczeństwa Serwisu i dochodzenia roszczeń. Dane będą przechowywane przez okres realizacji umowy i wymagany przepisami prawa (do 5 lat dla dokumentów podatkowych). Przysługuje Pani/Panu prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa). Podanie danych jest dobrowolne, lecz niezbędne do realizacji zamówienia. Szczegółowe informacje zawarte są w [Polityce prywatności](/polityka-prywatnosci).

---

## IMPLEMENTACJA W NEXT.JS (React + TypeScript)

```tsx
// components/OrderFormConsents.tsx

import { useState } from "react";

interface ConsentState {
  termsAccepted: boolean;
  digitalContentConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
}

export default function OrderFormConsents({
  onChange,
}: {
  onChange: (consents: ConsentState) => void;
}) {
  const [consents, setConsents] = useState<ConsentState>({
    termsAccepted: false,
    digitalContentConsent: false,
    analyticsConsent: false,
    marketingConsent: false,
  });

  const update = (key: keyof ConsentState, value: boolean) => {
    const updated = { ...consents, [key]: value };
    setConsents(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Klauzula informacyjna */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 leading-relaxed">
        <p className="font-semibold mb-1">Klauzula informacyjna RODO</p>
        <p>
          Administratorem Pani/Pana danych osobowych jest właściciel serwisu
          najembezkary.pl (kontakt:{" "}
          <a href="mailto:kontakt@najembezkary.pl" className="underline">
            kontakt@najembezkary.pl
          </a>
          ). Dane podane w formularzu będą przetwarzane w celu realizacji
          zamówienia i dostarczenia Pakietu dokumentów (art. 6 ust. 1 lit. b
          RODO), wypełnienia obowiązków prawnych (art. 6 ust. 1 lit. c RODO)
          oraz w celach wynikających z prawnie uzasadnionych interesów
          Administratora (art. 6 ust. 1 lit. f RODO). Szczegółowe informacje
          zawarte są w{" "}
          <a href="/polityka-prywatnosci" className="underline">
            Polityce prywatności
          </a>
          .
        </p>
      </div>

      {/* CHECKBOX 1 — Obowiązkowy: Regulamin + Polityka prywatności */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.termsAccepted}
          onChange={(e) => update("termsAccepted", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#1a3c5e] flex-shrink-0"
          data-testid="checkbox-terms"
          required
        />
        <span className="text-sm text-gray-700">
          Zapoznałem/am się z{" "}
          <a
            href="/regulamin"
            target="_blank"
            className="text-[#1a3c5e] underline"
          >
            Regulaminem serwisu najembezkary.pl
          </a>{" "}
          oraz{" "}
          <a
            href="/polityka-prywatnosci"
            target="_blank"
            className="text-[#1a3c5e] underline"
          >
            Polityką prywatności
          </a>{" "}
          i akceptuję ich treść. Wyrażam zgodę na przetwarzanie moich danych
          osobowych w celu realizacji zamówienia, na zasadach opisanych w{" "}
          <a
            href="/polityka-prywatnosci#cele-i-podstawy-prawne"
            target="_blank"
            className="text-[#1a3c5e] underline"
          >
            §4 Polityki prywatności
          </a>{" "}
          (art. 6 ust. 1 lit. b RODO).{" "}
          <span className="text-red-600 font-medium">*</span>
        </span>
      </label>

      {/* CHECKBOX 2 — Obowiązkowy: zgoda na natychmiastowe wykonanie + utrata prawa odstąpienia */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.digitalContentConsent}
          onChange={(e) => update("digitalContentConsent", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#1a3c5e] flex-shrink-0"
          data-testid="checkbox-digital-content"
          required
        />
        <span className="text-sm text-gray-700">
          Wyrażam wyraźną zgodę na natychmiastowe przystąpienie do realizacji
          umowy o dostarczenie treści cyfrowych przed upływem 14-dniowego
          terminu do odstąpienia od umowy. Przyjmuję do wiadomości, że z chwilą
          udostępnienia Pakietu do pobrania{" "}
          <strong>utracę prawo do odstąpienia od umowy</strong>, zgodnie z art.
          38 pkt 13 ustawy o prawach konsumenta.{" "}
          <span className="text-red-600 font-medium">*</span>
        </span>
      </label>

      {/* CHECKBOX 3 — Opcjonalny: cookies analityczne i marketingowe */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.analyticsConsent}
          onChange={(e) => update("analyticsConsent", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#1a3c5e] flex-shrink-0"
          data-testid="checkbox-analytics"
        />
        <span className="text-sm text-gray-500">
          Wyrażam zgodę na stosowanie plików cookies analitycznych i
          marketingowych (szczegóły:{" "}
          <a
            href="/polityka-prywatnosci#pliki-cookies"
            target="_blank"
            className="text-[#1a3c5e] underline"
          >
            §10 Polityki prywatności
          </a>
          ). Zgodę mogę wycofać w każdym czasie.{" "}
          <span className="text-gray-400">(opcjonalne)</span>
        </span>
      </label>

      {/* CHECKBOX 4 — Opcjonalny: marketing emailowy */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.marketingConsent}
          onChange={(e) => update("marketingConsent", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#1a3c5e] flex-shrink-0"
          data-testid="checkbox-marketing"
        />
        <span className="text-sm text-gray-500">
          Wyrażam zgodę na przesyłanie informacji handlowych drogą
          elektroniczną (newsletter, aktualizacje przepisów o najmie
          krótkoterminowym). Zgodę mogę wycofać w każdym czasie.{" "}
          <span className="text-gray-400">(opcjonalne)</span>
        </span>
      </label>

      {/* Informacja o polach obowiązkowych */}
      <p className="text-xs text-gray-400">
        <span className="text-red-600">*</span> Pola obowiązkowe. Bez
        zaznaczenia tych pól realizacja zamówienia jest niemożliwa.
      </p>
    </div>
  );
}
```

---

## WALIDACJA PRZED WYSŁANIEM ZAMÓWIENIA

```typescript
// W funkcji obsługi zamówienia (checkout handler):

function validateConsents(consents: ConsentState): string | null {
  if (!consents.termsAccepted) {
    return "Zaakceptowanie Regulaminu i Polityki prywatności jest wymagane.";
  }
  if (!consents.digitalContentConsent) {
    return "Zgoda na natychmiastowe dostarczenie treści cyfrowych jest wymagana.";
  }
  return null; // wszystko OK
}

// Przed wywołaniem /api/checkout:
const validationError = validateConsents(consents);
if (validationError) {
  toast({ title: "Wymagane zgody", description: validationError, variant: "destructive" });
  return;
}

// Przekaż zgody do backendu i zapisz w bazie:
const response = await fetch("/api/checkout", {
  method: "POST",
  body: JSON.stringify({
    ownerData,
    quizAnswers,
    email,
    consents: {
      termsAccepted: consents.termsAccepted,
      termsAcceptedAt: new Date().toISOString(),
      digitalContentConsent: consents.digitalContentConsent,
      digitalContentConsentAt: new Date().toISOString(),
      analyticsConsent: consents.analyticsConsent,
      marketingConsent: consents.marketingConsent,
    },
  }),
});
```

---

## ZAPIS ZGÓD W SUPABASE

Dodaj do tabeli `orders` kolumny:

```sql
ALTER TABLE orders ADD COLUMN consents JSONB;
-- Przykładowa wartość:
-- {
--   "termsAccepted": true,
--   "termsAcceptedAt": "2026-04-04T07:54:00.000Z",
--   "digitalContentConsent": true,
--   "digitalContentConsentAt": "2026-04-04T07:54:00.000Z",
--   "analyticsConsent": false,
--   "marketingConsent": false,
--   "ipAddress": "1.2.3.4",
--   "userAgent": "Mozilla/5.0..."
-- }
```

Zapis zgód z IP i User-Agent jest dobrą praktyką — umożliwia udowodnienie udzielenia zgody w przypadku sporu z UODO.
