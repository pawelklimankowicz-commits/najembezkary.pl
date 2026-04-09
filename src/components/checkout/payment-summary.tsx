"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DATA_STORAGE_KEY, QUIZ_STORAGE_KEY, type OwnerDataState, type QuizState } from "@/lib/checkout-flow";
import { formatPricePln, getPackagePricing } from "@/lib/pricing";

export function PaymentSummary() {
  const router = useRouter();
  const [owner, setOwner] = useState<OwnerDataState | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const o = sessionStorage.getItem(DATA_STORAGE_KEY);
    const q = sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (o) setOwner(JSON.parse(o) as OwnerDataState);
    if (q) setQuiz(JSON.parse(q) as QuizState);
  }, []);

  const pricing = getPackagePricing(quiz?.propertyCount);

  async function goToStripeCheckout() {
    setPaymentError(null);
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyCount: pricing.propertyCount,
          customerEmail: owner?.email,
          customerName: owner?.fullName,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !payload.url) {
        throw new Error(payload.error || "Nie udało się rozpocząć płatności.");
      }
      window.location.href = payload.url;
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : "Nie udało się rozpocząć płatności.");
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <div className="wizard" style={{ fontWeight: 700 }}>
      <ul>
        <li>Liczba lokali: {pricing.propertyCount}</li>
        {!pricing.isCustomQuote && pricing.perUnit ? (
          <li>Cena za lokal: {formatPricePln(pricing.perUnit).replace(" zł", " złotych")}</li>
        ) : null}
        <li>Właściciel: {owner?.fullName ?? "-"}</li>
        <li>Lokal: {owner?.propertyAddress ?? "-"}</li>
        <li>Email: {owner?.email ?? "-"}</li>
        <li>Telefon: {owner?.phone ?? "-"}</li>
      </ul>
      <div className="wizard-nav">
        <button className="btn-secondary" onClick={() => router.push("/dane")}>
          Wstecz
        </button>
        {pricing.isCustomQuote ? (
          <a className="btn-primary" href="mailto:kontakt@najembezkary.pl?subject=Wycena%20indywidualna%20pakietu%20dokumentow">
            Poproś o wycenę
          </a>
        ) : (
          <button className="btn-primary" onClick={() => void goToStripeCheckout()} disabled={paymentLoading}>
            {paymentLoading ? "Przekierowanie..." : `Zapłać ${formatPricePln(pricing.total ?? 0)}`}
          </button>
        )}
      </div>
      {paymentError ? <p className="wizard-error">{paymentError}</p> : null}
    </div>
  );
}
