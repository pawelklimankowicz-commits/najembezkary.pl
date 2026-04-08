# Prompt do Cursor Pro — Navbar + Hero z licznikiem dla najembezkary.pl

## Wklej do Cursor Pro (Composer):

---

```
Zaimplementuj dwie rzeczy w projekcie najembezkary.pl:
1. Globalny komponent Navbar
2. Sekcję Hero na landing page z dynamicznym licznikiem

---

## CZĘŚĆ 1 — KOMPONENT NAVBAR

Utwórz plik: src/components/Navbar.tsx

### Wymagania:
- Białe tło bg-white z cieniem border-b border-gray-200 shadow-sm
- Sticky: sticky top-0 z-50
- Brak przełącznika motywów (dark mode) — usuń jeśli istnieje
- Maksymalna szerokość: max-w-6xl mx-auto px-4

### Lewa strona — logo:
- Link href="/" z tekstem "najembezkary.pl"
- Styl: font-bold text-xl text-[#C0392B] tracking-tight
- Opcjonalnie: mała ikonka ⚖ lub 🏠 przed tekstem

### Środek — brak (pusty)

### Prawa strona:
- Przycisk CTA: "Sprawdź obowiązek →"
- Styl: bg-[#C0392B] hover:bg-[#A93226] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm
- href="/quiz"

### Kod komponentu:

```tsx
// src/components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-[#C0392B] tracking-tight hover:opacity-80 transition-opacity"
        >
          najembezkary.pl
        </Link>

        {/* CTA */}
        <Link
          href="/quiz"
          className="bg-[#C0392B] hover:bg-[#A93226] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-sm whitespace-nowrap"
        >
          Sprawdź obowiązek →
        </Link>
      </div>
    </nav>
  );
}
```

### Komponent Footer:

Utwórz plik: src/components/Footer.tsx

```tsx
// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo i copyright */}
          <div className="text-center md:text-left">
            <p className="font-bold text-[#C0392B]">najembezkary.pl</p>
            <p className="text-xs text-gray-400 mt-1">
              © {new Date().getFullYear()} najembezkary.pl. Wszelkie prawa zastrzeżone.
            </p>
          </div>

          {/* Linki prawne */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link
              href="/regulamin"
              className="hover:text-[#C0392B] transition-colors"
            >
              Regulamin
            </Link>
            <Link
              href="/polityka-prywatnosci"
              className="hover:text-[#C0392B] transition-colors"
            >
              Polityka prywatności
            </Link>
            <a
              href="mailto:kontakt@najembezkary.pl"
              className="hover:text-[#C0392B] transition-colors"
            >
              Kontakt
            </a>
          </div>
        </div>

        {/* Disclaimer prawny */}
        <p className="text-xs text-gray-400 text-center mt-6 border-t border-gray-100 pt-4">
          Serwis ma charakter informacyjny. Nie świadczymy usług prawnych.
          Dokumenty generowane są automatycznie i wymagają weryfikacji przez użytkownika.
        </p>
      </div>
    </footer>
  );
}
```

### Dodaj Navbar i Footer do layoutu:

W pliku src/app/layout.tsx dodaj import i użyj obu komponentów:

```tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## CZĘŚĆ 2 — HERO Z DYNAMICZNYM LICZNIKIEM

### Komponent CountdownTimer:

Utwórz plik: src/components/CountdownTimer.tsx

Licznik odlicza do: 20 maja 2026, godz. 00:00:00

Logika:
- Jeśli data docelowa jeszcze nie minęła → wyświetl countdown (dni, godz., min., sek.)
- Jeśli data minęła → wyświetl komunikat "Obowiązek rejestracji już aktywny"

```tsx
// src/components/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-05-20T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const now = new Date();
  const diff = TARGET_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Zapobiegaj hydration mismatch
  if (!mounted) return null;

  if (timeLeft.expired) {
    return (
      <div className="bg-[#C0392B] rounded-2xl p-5 text-center">
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
          Status obowiązku
        </p>
        <p className="text-white text-xl font-bold">
          ⚠️ Obowiązek rejestracji już aktywny
        </p>
        <p className="text-white/70 text-xs mt-1">
          Termin: 20 maja 2026 — zarejestruj się teraz
        </p>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { label: "dni", value: timeLeft.days },
    { label: "godz.", value: timeLeft.hours },
    { label: "min.", value: timeLeft.minutes },
    { label: "sek.", value: timeLeft.seconds },
  ];

  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-5">
      <p className="text-white/50 text-xs font-semibold uppercase tracking-widest text-center mb-4">
        Czas do wejścia przepisów
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="bg-white/10 rounded-xl py-3">
              <span className="text-[#E8B84B] text-3xl font-mono font-bold tabular-nums">
                {label === "dni" ? value : pad(value)}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1.5 uppercase tracking-wider">
              {label}
            </p>
          </div>
        ))}
      </div>
      <p className="text-white/30 text-xs text-center mt-4">
        Termin: 20 maja 2026 r.
      </p>
    </div>
  );
}
```

### Sekcja Hero na landing page (src/app/page.tsx):

Zamień obecną sekcję hero na:

```tsx
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

// W JSX strony głównej:
<section className="bg-gradient-to-b from-[#FDF0F0] to-white pt-16 pb-20">
  <div className="max-w-6xl mx-auto px-4">
    <div className="grid lg:grid-cols-2 gap-12 items-center">

      {/* Lewa kolumna — treść */}
      <div>
        {/* Pill z alertem */}
        <div className="inline-flex items-center gap-2 bg-red-100 text-[#C0392B] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
          Nowe przepisy — termin 20 maja 2026
        </div>

        {/* Nagłówek */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Od 20 maja 2026 najem krótkoterminowy{" "}
          <span className="text-[#C0392B]">wymaga rejestracji</span>
        </h1>

        {/* Podkreślony alert */}
        <div className="border-l-4 border-[#C0392B] pl-4 mb-6">
          <p className="text-gray-600 text-lg">
            Brak rejestracji ={" "}
            <strong className="text-[#C0392B]">kara do 50 000 zł</strong>.
            Przygotuj dokumenty w 15 minut.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link
            href="/quiz"
            className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 text-center"
          >
            Sprawdź obowiązek i pobierz dokumenty →
          </Link>
        </div>

        {/* Badge cena */}
        <div className="inline-flex items-center gap-2 bg-[#E8B84B]/15 border border-[#E8B84B] text-[#7D5C00] text-sm font-medium px-4 py-2 rounded-full">
          <span>✓</span>
          399 zł — jednorazowo • Dokumenty gotowe w 5 minut
        </div>
      </div>

      {/* Prawa kolumna — countdown */}
      <div className="lg:flex lg:justify-end">
        <div className="w-full max-w-sm">
          <CountdownTimer />
        </div>
      </div>

    </div>
  </div>
</section>
```

---

## PODSUMOWANIE ZMIAN

1. `src/components/Navbar.tsx` — nowy komponent
2. `src/components/Footer.tsx` — nowy komponent z linkami Regulamin + PP
3. `src/components/CountdownTimer.tsx` — licznik z logiką expired
4. `src/app/layout.tsx` — dodaj Navbar i Footer
5. `src/app/page.tsx` — zastąp hero nową sekcją

Zacznij od Navbar i Footer (layout.tsx), potem CountdownTimer, potem hero w page.tsx.
Nie zmieniaj logiki biznesowej, quizu ani formularzy.
```
