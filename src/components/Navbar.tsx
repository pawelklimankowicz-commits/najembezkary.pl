export default function Navbar() {
  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <a href="/" className="app-brand">
          <img src="/logo-corner.svg" alt="najembezkary.pl" className="app-brand-logo" />
        </a>
        <div className="app-nav-links">
          <a href="/quiz">Quiz</a>
          <a href="/dane">Formularz</a>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Polityka prywatnosci</a>
        </div>
        <a href="/quiz" className="btn-primary app-nav-cta">
          Sprawdz obowiazek →
        </a>
      </div>
    </nav>
  );
}
