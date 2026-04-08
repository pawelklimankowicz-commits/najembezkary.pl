export default function Navbar() {
  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <a href="/" className="app-brand">
          <img src="/logo-corner.svg" alt="najembezkary.pl" className="app-brand-logo" />
        </a>
        <a href="/quiz" className="btn-primary app-nav-cta">
          Sprawdź obowiązek
        </a>
      </div>
    </nav>
  );
}
