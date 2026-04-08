import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="hero">
        <p className="badge">399 zl - jednorazowo - Dokumenty gotowe w 5 minut</p>
        <h1>Od 20 maja 2026 najem krotkoterminowy wymaga rejestracji</h1>
        <p>
          Brak rejestracji = kara do 50 000 zl. Sprawdz obowiazek i przygotuj pakiet
          dokumentow online.
        </p>
        <div className="hero-actions">
          <Link href="/quiz" className="btn-primary">
            Sprawdz obowiazek i pobierz dokumenty
          </Link>
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
