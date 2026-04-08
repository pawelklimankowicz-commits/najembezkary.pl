import Link from "next/link";

export function SiteNav() {
  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Glowna nawigacja">
        <Link href="/" className="site-brand">
          najembezkary.pl
        </Link>
        <div className="site-nav-links">
          <Link href="/quiz">Quiz</Link>
          <Link href="/dane">Dane</Link>
          <Link href="/platnosc">Platnosc</Link>
          <Link href="/regulamin">Regulamin</Link>
        </div>
      </nav>
    </header>
  );
}
