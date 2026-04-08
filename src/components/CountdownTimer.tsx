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
      <div className="countdown-card countdown-card--expired">
        <p className="countdown-label">Status obowiązku</p>
        <p className="countdown-expired-title">Obowiązek rejestracji już aktywny</p>
        <p className="countdown-expired-subtitle">
          Termin minął: 20 maja 2026 — zadbaj o rejestrację jak najszybciej.
        </p>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="countdown-card">
      <p className="countdown-label">Czas do wejścia przepisów</p>
      <div className="countdown-grid">
        <div className="countdown-cell">
          <div className="countdown-value-wrap">
            <span className="countdown-value">{timeLeft.days}</span>
          </div>
          <p className="countdown-unit">Dni</p>
        </div>
        <div className="countdown-cell">
          <div className="countdown-value-wrap">
            <span className="countdown-value">{pad(timeLeft.hours)}</span>
          </div>
          <p className="countdown-unit">Godz.</p>
        </div>
        <div className="countdown-cell">
          <div className="countdown-value-wrap">
            <span className="countdown-value">{pad(timeLeft.minutes)}</span>
          </div>
          <p className="countdown-unit">Min.</p>
        </div>
        <div className="countdown-cell">
          <div className="countdown-value-wrap">
            <span className="countdown-value">{pad(timeLeft.seconds)}</span>
          </div>
          <p className="countdown-unit">Sek.</p>
        </div>
      </div>
      <p className="countdown-footer">Termin: 20 maja 2026 r.</p>
    </div>
  );
}
