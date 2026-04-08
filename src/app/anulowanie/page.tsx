import Link from "next/link";

export default function AnulowaniePage() {
  return (
    <main className="page-shell">
      <div className="cancel-icon">
        <span>✕</span>
      </div>
      <h1 className="page-title">Platnosc zostala anulowana.</h1>
      <p className="page-intro">Wroc do podsumowania i sprobuj ponownie.</p>
      <Link href="/platnosc" className="btn-primary">
        Wroc i sprobuj ponownie
      </Link>
    </main>
  );
}
