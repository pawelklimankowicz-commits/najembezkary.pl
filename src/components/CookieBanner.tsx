"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "nbk.cookies.choice.v1";
type CookieChoice = "all" | "necessary";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __nbkAnalyticsLoaded?: boolean;
  }
}

function enableAnalyticsIfConfigured() {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID) return;
  if (window.__nbkAnalyticsLoaded) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
  window.__nbkAnalyticsLoaded = true;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const choice = window.localStorage.getItem(COOKIE_CONSENT_KEY) as CookieChoice | null;
      if (!choice) {
        setVisible(true);
      } else if (choice === "all") {
        enableAnalyticsIfConfigured();
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function saveChoice(choice: CookieChoice) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    } catch {
      // ignore
    }
    if (choice === "all") {
      enableAnalyticsIfConfigured();
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-0 left-1/2 z-50 w-[min(960px,calc(100%-1.5rem))] -translate-x-1/2 rounded-t-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <p className="text-sm text-slate-700">
        Używamy plików cookies, aby zapewnić prawidłowe działanie serwisu i analizować ruch.
        Korzystając ze strony akceptujesz ich użycie. Szczegóły znajdziesz w{" "}
        <Link href="/polityka-prywatnosci" className="underline">
          Polityce prywatności
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={() => saveChoice("necessary")}>
          Tylko niezbędne
        </button>
        <button type="button" className="btn-primary" onClick={() => saveChoice("all")}>
          Akceptuję wszystkie
        </button>
      </div>
    </div>
  );
}
