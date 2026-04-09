"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

const HIDE_NAV_ON_PATH_PREFIXES = ["/quiz", "/dane", "/przygotuj", "/platnosc", "/sukces"];

const NAV_LINKS = [
  { href: "/", label: "O nas" },
  { href: "/#jak-to-dziala", label: "Jak to działa" },
  { href: "/cennik", label: "Cennik" },
  { href: "/#faq", label: "FAQ" },
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { href: "mailto:kontakt@najembezkary.pl", label: "Kontakt" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const shouldHideNav = HIDE_NAV_ON_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen, closeMenu]);

  if (shouldHideNav) {
    return null;
  }

  return (
    <nav className="app-nav" aria-label="Nawigacja główna">
      <div className="app-nav-inner">
        <a href="/" className="app-brand">
          <img src="/logo-corner-v3.svg" alt="najembezkary.pl" className="app-brand-logo" />
        </a>
        <div className="app-nav-links app-nav-links-desktop">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={`${href}-${label}`} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="app-nav-actions">
          <a href="/quiz" className="btn-primary app-nav-cta">
            Sprawdź obowiązek
          </a>
          <button
            type="button"
            className="app-nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="app-nav-menu-toggle-bars" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="app-nav-mobile-backdrop"
          aria-label="Zamknij menu"
          tabIndex={-1}
          onClick={closeMenu}
        />
      ) : null}

      <div
        id={menuId}
        className={`app-nav-mobile-panel${menuOpen ? " is-open" : ""}`}
        hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu nawigacji"
      >
        <div className="app-nav-mobile-panel-inner">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={`m-${href}-${label}`} href={href} className="app-nav-mobile-link" onClick={closeMenu}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
