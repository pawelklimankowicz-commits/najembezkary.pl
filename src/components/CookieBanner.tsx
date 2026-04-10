"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "nbk.cookies.choice.v1";
const COOKIE_BANNER_SESSION_KEY = "nbk.cookies.banner.hidden.session.v1";
type CookieChoice = "all" | "necessary";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const REJECT_REDIRECT_URL = "https://www.google.com";

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
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      return;
    }
    try {
      const choice = window.localStorage.getItem(COOKIE_CONSENT_KEY) as CookieChoice | null;
      setVisible(!choice);
      if (choice === "all") {
        enableAnalyticsIfConfigured();
      }
    } catch {
      setVisible(true);
    }
  }, [pathname]);

  function saveChoice(choice: CookieChoice) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
      window.sessionStorage.setItem(COOKIE_BANNER_SESSION_KEY, "1");
    } catch {
      // ignore
    }
    if (choice === "all") {
      enableAnalyticsIfConfigured();
    }
    setVisible(false);
  }

  function rejectAndExit() {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, "necessary");
      window.sessionStorage.setItem(COOKIE_BANNER_SESSION_KEY, "1");
    } catch {
      // ignore
    }
    window.location.replace(REJECT_REDIRECT_URL);
  }

  useEffect(() => {
    if (pathname !== "/" || !visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [pathname, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/55 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        className="w-[min(720px,100%)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <p className="text-sm text-slate-700">
          Używamy plików cookies, aby zapewnić prawidłowe działanie serwisu i analizować ruch.
          Szczegóły znajdziesz w{" "}
          <Link href="/polityka-prywatnosci" className="underline">
            Polityce prywatności
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={rejectAndExit}>
            Nie zgadzam się
          </button>
          <button type="button" className="btn-primary" onClick={() => saveChoice("all")}>
            Akceptuję i przechodzę dalej
          </button>
        </div>
      </div>
    </div>
  );
}
