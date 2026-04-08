import Link from "next/link";

export default function SukcesPage() {
  return (
    <main className="page-shell">
      <h1 className="page-title">Dziekujemy! Twoje dokumenty sa gotowe.</h1>
      <p className="page-intro">
        To jest wersja MVP - podlaczymy Stripe, generowanie ZIP i wysylke email w kolejnym kroku.
      </p>
      <p>
        <Link href="/przygotuj" className="btn-primary">
          Pobierz pakiet dokumentow (ZIP)
        </Link>
      </p>
    </main>
  );
}
