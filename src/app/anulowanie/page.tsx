import Link from "next/link";

export default function AnulowaniePage() {
  return (
    <main className="page-shell">
      <div className="cancel-icon">
        <span>✕</span>
      </div>
      <h1 className="page-title">Płatność została anulowana.</h1>
      <p className="page-intro">Wróć do podsumowania i spróbuj ponownie.</p>
      <Link href="/platnosc" className="btn-primary">
        Wróć i spróbuj ponownie
      </Link>
    </main>
  );
}
