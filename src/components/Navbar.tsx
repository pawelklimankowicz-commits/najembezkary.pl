export default function Navbar() {
  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <a href="/" className="app-brand">
          <img src="/logo-corner.svg" alt="najembezkary.pl" className="app-brand-logo" />
        </a>
        <div className="app-nav-links">
          <a href="/">O nas</a>
          <a href="/#jak-to-dziala">Jak to działa</a>
          <a href="/#faq">FAQ</a>
          <a href="/regulamin">Regulamin</a>
          <a href="/polityka-prywatnosci">Polityka prywatności</a>
          <a href="mailto:kontakt@najembezkary.pl">Kontakt</a>
        </div>
        <a href="/quiz" className="btn-primary app-nav-cta">
          Sprawdź obowiązek
        </a>
      </div>
    </nav>
  );
}
