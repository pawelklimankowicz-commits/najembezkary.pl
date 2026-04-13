import type { Metadata } from "next";
import { PaymentSummary } from "@/components/checkout/payment-summary";

export const metadata: Metadata = {
  title: "Płatność – Kup pakiet dokumentów | najembezkary.pl",
  description:
    "Sfinalizuj zamówienie i pobierz komplet dokumentów do rejestracji najmu krótkoterminowego. Bezpieczna płatność online.",
  robots: { index: false, follow: false },
};

export default function PlatnoscPage() {
  return (
    <main className="page-shell dane-shell">
      <h1 className="page-title">Krok 3 z 3 - Płatność</h1>
      <p className="page-intro">Podsumowanie i przejście do zakupu pakietu.</p>
      <PaymentSummary />
    </main>
  );
}
