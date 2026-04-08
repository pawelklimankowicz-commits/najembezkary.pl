import { PaymentSummary } from "@/components/checkout/payment-summary";

export default function PlatnoscPage() {
  return (
    <main className="page-shell dane-shell">
      <h1 className="page-title">Krok 3 z 3 - Platnosc</h1>
      <p className="page-intro">Podsumowanie i przejscie do zakupu pakietu.</p>
      <PaymentSummary />
    </main>
  );
}
