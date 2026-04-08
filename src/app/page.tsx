import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="hero">
        <p className="badge">Generator dokumentów dla zgłoszenia najmu krótkoterminowego</p>
        <h1>Nowoczesne narzędzie do przygotowania dokumentów rejestracyjnych najmu krótkoterminowego</h1>
        <div className="hero-content">
          <div className="hero-main-copy">
            <div className="hero-warning">
              <div className="hero-warning-bar" />
              <div>
                <p className="hero-warning-title">Brak rejestracji najmu = kara do 50 000 zł</p>
                <p className="hero-warning-text">
                  W jednym procesie sprawdzisz obowiązek zgłoszenia, uzupełnisz dane i pobierzesz gotowy pakiet
                  dokumentów przygotowany do złożenia w urzędzie.
                </p>
              </div>
            </div>
            <div className="hero-actions">
              <Link href="/quiz" className="btn-primary hero-cta">
                Sprawdź obowiązek i pobierz dokumenty →
              </Link>
              <Link href="/przygotuj" className="btn-secondary hero-cta-secondary">
                Przejdź bezpośrednio do kreatora
              </Link>
            </div>
            <p className="hero-subline">
              Ponad 3000 właścicieli skorzystało z generatora, aby uporządkować formalności bez
              oczekiwania na konsultacje.
            </p>
          </div>
          <div className="hero-countdown">
            <CountdownTimer />
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="trust-item">Dokumenty gotowe do edycji i wydruku</div>
        <div className="trust-item">Wersje zgod i historii dla RODO</div>
        <div className="trust-item">Integracja procesu od quizu po pobranie</div>
      </section>

      <section className="client-logos">
        <p>Z rozwiązania korzystają właściciele mieszkań, operatorzy i zarządcy najmu w całej Polsce</p>
        <div className="client-logos-grid">
          <span>Airbnb Host</span>
          <span>Booking Operator</span>
          <span>Zarządca najmu</span>
          <span>Biuro obsługi</span>
        </div>
      </section>

      <section className="landing-section">
        <h2>Poznaj funkcje, które usprawnią Twoją pracę</h2>
        <div className="info-grid">
          <article className="info-card">
            <h3>Weryfikacja obowiązku rejestracji</h3>
            <p>Quiz prowadzi przez kluczowe pytania i pokazuje rekomendowany dalszy krok.</p>
          </article>
          <article className="info-card">
            <h3>Generator pakietu dokumentów</h3>
            <p>Automatycznie tworzysz komplet dokumentów dla urzędu i dla potrzeb archiwizacji.</p>
          </article>
          <article className="info-card">
            <h3>Wyszukiwarka gmin i urzędów</h3>
            <p>Po wyborze lokalizacji otrzymujesz dane urzędu, BIP i rekomendowany sposób złożenia.</p>
          </article>
          <article className="info-card">
            <h3>Raporty zgod RODO</h3>
            <p>Masz gotowy eksport zgod i historii operacji na potrzeby klienta lub UODO.</p>
          </article>
          <article className="info-card">
            <h3>Proces usuwania danych</h3>
            <p>Endpoint prawa do bycia zapomnianym anonimizuje dane i zapisuje ślady audytowe.</p>
          </article>
          <article className="info-card">
            <h3>Szybkie wdrożenie</h3>
            <p>Aplikacja działa od razu lokalnie i jest gotowa do dalszego rozwoju na Vercel.</p>
          </article>
        </div>
      </section>

      <section className="landing-section">
        <h2>Co zawiera pakiet</h2>
        <ul className="check-list">
          <li>Wniosek o wpis do rejestru obiektów krótkotrwałego zakwaterowania</li>
          <li>Oświadczenie właściciela lokalu</li>
          <li>Regulamin lokalu dla gości</li>
          <li>Wzór umowy najmu krótkoterminowego</li>
          <li>Checklista dokumentów wymaganych przez urząd</li>
          <li>Instrukcja krok po kroku: co złożyć, gdzie i w jakiej kolejności</li>
        </ul>
        <p className="section-note">
          Pakiet jest generowany na podstawie Twoich odpowiedzi i gotowy do pobrania jako plik ZIP.
        </p>
      </section>

      <section className="landing-section">
        <h2>Jak to działa</h2>
        <ol className="steps-list">
          <li>
            <strong>Krok 1:</strong> Odpowiadasz na 5 pytań i sprawdzasz, czy obowiązek
            rejestracji dotyczy Twojego przypadku.
          </li>
          <li>
            <strong>Krok 2:</strong> Uzupełniasz dane właściciela i lokalu, potrzebne do
            przygotowania dokumentów.
          </li>
          <li>
            <strong>Krok 3:</strong> Pobierasz paczkę ZIP i składasz dokumenty we właściwym
            urzędzie.
          </li>
        </ol>
      </section>

      <section className="landing-section dark-pricing">
        <h2>Dlaczego 399 zł</h2>
        <div className="pricing-compare">
          <article className="pricing-card pricing-card--muted">
            <h3>U prawnika</h3>
            <p>Najczęściej 300-800 zł za samą konsultację i dodatkowy czas oczekiwania.</p>
          </article>
          <article className="pricing-card pricing-card--highlight">
            <h3>najembezkary.pl</h3>
            <p>
              Jedna opłata, gotowy pakiet dokumentów i jasna ścieżka dalszych kroków od razu po
              wypełnieniu formularza.
            </p>
          </article>
        </div>
      </section>

      <section className="stats-grid">
        <article>
          <p className="stats-value">15 min</p>
          <p className="stats-label">średni czas przygotowania pakietu</p>
        </article>
        <article>
          <p className="stats-value">6 dokumentów</p>
          <p className="stats-label">w jednej paczce ZIP</p>
        </article>
        <article>
          <p className="stats-value">24/7</p>
          <p className="stats-label">dostęp do generatora online</p>
        </article>
        <article>
          <p className="stats-value">1 proces</p>
          <p className="stats-label">od quizu do pobrania dokumentów</p>
        </article>
      </section>

      <section className="landing-section dark-band">
        <h2>Przyspiesz formalności i ogranicz ryzyko błędów</h2>
        <p>
          Otrzymujesz uporządkowany proces: od sprawdzenia obowiązku, przez uzupełnienie danych,
          po gotowe dokumenty i instrukcje złożenia.
        </p>
        <p>
          <Link href="/quiz" className="btn-primary">
            Uruchom proces teraz →
          </Link>
        </p>
      </section>

      <section className="landing-section faq-section">
        <h2>FAQ</h2>
        <div className="faq-list">
          <article>
            <h3>Czy to dotyczy mojego mieszkania?</h3>
            <p>
              Od tego zaczyna się quiz. Po kilku pytaniach zobaczysz, czy prawdopodobnie podlegasz
              rejestracji i jaki wariant dokumentów wybrać.
            </p>
          </article>
          <article>
            <h3>Czy dokumenty są zgodne z przepisami?</h3>
            <p>
              Szablony są przygotowane pod aktualny model rejestracji, ale przed złożeniem warto
              sprawdzić wymagania Twojej gminy (BIP i komunikaty lokalne).
            </p>
          </article>
          <article>
            <h3>Czy mogę pobrać dokumenty wielokrotnie?</h3>
            <p>
              Tak, w okresie ważności linku możesz pobierać paczkę ponownie. Zalecamy zapisanie
              plików lokalnie po pierwszym pobraniu.
            </p>
          </article>
        </div>
        <p className="disclaimer">
          Serwis ma charakter informacyjny. Nie świadczymy usług prawnych, a dokumenty wymagają
          weryfikacji przez użytkownika przed złożeniem.
        </p>
      </section>

      <section className="landing-section cta-final">
        <h2>Uprość formalności i działaj od razu</h2>
        <p>
          Zacznij od quizu, aby sprawdzić obowiązek rejestracji i od razu przejść do
          przygotowania dokumentów.
        </p>
        <p>
          <Link href="/quiz" className="btn-primary">
            Rozpocznij teraz →
          </Link>
        </p>
      </section>
    </main>
  );
}
