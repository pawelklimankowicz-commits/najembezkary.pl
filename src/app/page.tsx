import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="hero">
        <p className="badge">399 zl — jednorazowo • Dokumenty gotowe w 5 minut</p>
        <h1>Od 20 maja 2026 najem krotkoterminowy wymaga rejestracji</h1>
        <div className="hero-content">
          <div className="hero-main-copy">
            <div className="hero-warning">
              <div className="hero-warning-bar" />
              <div>
                <p className="hero-warning-title">Brak rejestracji = kara do 50 000 zl</p>
                <p className="hero-warning-text">
                  Sprawdz, czy obowiazek dotyczy Twojego lokalu i przygotuj komplet dokumentow w
                  kilka minut, zamiast dni.
                </p>
              </div>
            </div>
            <div className="hero-actions">
              <Link href="/quiz" className="btn-primary hero-cta">
                Sprawdz obowiazek i pobierz dokumenty
              </Link>
            </div>
          </div>
          <div className="hero-countdown">
            <CountdownTimer />
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Dla kogo</h2>
        <ul>
          <li>Wlasciciele wynajmujacy przez Airbnb</li>
          <li>Wlasciciele wynajmujacy przez Booking.com</li>
          <li>Operatorzy kilku mieszkan</li>
        </ul>
      </section>

      <section className="landing-section">
        <h2>Co zawiera pakiet</h2>
        <ul>
          <li>Wniosek o wpis do rejestru</li>
          <li>Oswiadczenie wlasciciela lokalu</li>
          <li>Regulamin lokalu dla gosci</li>
          <li>Instrukcja krok po kroku</li>
          <li>Checklista dokumentow</li>
          <li>Wzor umowy najmu krotkoterminowego</li>
        </ul>
      </section>

      <section className="landing-section">
        <h2>Jak to dziala</h2>
        <ol>
          <li>Odpowiadasz na 5 pytan</li>
          <li>Uzupelniasz dane wlasciciela i lokalu</li>
          <li>Placisz i pobierasz paczke ZIP</li>
        </ol>
      </section>
    </main>
  );
}
