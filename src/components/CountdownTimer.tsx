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

  if (!mounted) return null;

  if (timeLeft.expired) {
    return (
      <div className="bg-[#C0392B] rounded-2xl p-5 text-center">
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
          Status obowiazku
        </p>
        <p className="text-white text-xl font-bold">⚠ Obowiazek rejestracji juz aktywny</p>
        <p className="text-white/70 text-xs mt-1">Termin: 20 maja 2026 — zarejestruj sie teraz</p>
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
        Czas do wejscia przepisow
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="bg-white/10 rounded-xl py-3">
              <span className="text-[#E8B84B] text-3xl font-mono font-bold tabular-nums">
                {label === "dni" ? value : pad(value)}
              </span>
            </div>
            <p className="text-white/50 text-xs mt-1.5 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-white/30 text-xs text-center mt-4">Termin: 20 maja 2026 r.</p>
    </div>
  );
}
