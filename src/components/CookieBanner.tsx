"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
    setVisible(true);
  }, [pathname]);

  function acceptAndContinue() {
    enableAnalyticsIfConfigured();
    setVisible(false);
  }

  function rejectAndExit() {
    window.location.replace(REJECT_REDIRECT_URL);
  }

  useEffect(() => {
    const shouldLock = pathname === "/" && visible;
    if (!shouldLock) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [pathname, visible]);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.55)",
        padding: "1rem",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        style={{
          width: "min(720px, 100%)",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: "1.25rem",
          boxShadow: "0 20px 48px rgba(15, 23, 42, 0.30)",
        }}
      >
        <p style={{ margin: 0, color: "#334155", fontSize: "14px", lineHeight: 1.5 }}>
          Używamy plików cookies, aby zapewnić prawidłowe działanie serwisu i analizować ruch.
          Szczegóły znajdziesz w{" "}
          <Link href="/polityka-prywatnosci" style={{ textDecoration: "underline" }}>
            Polityce prywatności
          </Link>
          .
        </p>
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button type="button" className="btn-secondary" onClick={rejectAndExit}>
            Nie zgadzam się
          </button>
          <button type="button" className="btn-primary" onClick={acceptAndContinue}>
            Akceptuję i przechodzę dalej
          </button>
        </div>
      </div>
    </div>
  );
}
