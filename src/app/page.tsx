import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="hero">
        <p className="badge">Platforma dokumentow dla najmu krotkoterminowego</p>
        <h1>Nowoczesne narzedzie do przygotowania dokumentow rejestracyjnych</h1>
        <div className="hero-content">
          <div className="hero-main-copy">
            <div className="hero-warning">
              <div className="hero-warning-bar" />
              <div>
                <p className="hero-warning-title">Brak rejestracji = kara do 50 000 zl</p>
                <p className="hero-warning-text">
                  Jednym procesem sprawdzisz obowiazek, uzupelnisz dane i pobierzesz gotowy pakiet
                  dokumentow przygotowany do zlozenia w urzedzie.
                </p>
              </div>
            </div>
            <div className="hero-actions">
              <Link href="/quiz" className="btn-primary hero-cta">
                Sprawdz obowiazek i pobierz dokumenty →
              </Link>
              <Link href="/przygotuj" className="btn-secondary hero-cta-secondary">
                Przejdz bezposrednio do kreatora
              </Link>
            </div>
            <p className="hero-subline">
              Ponad 3000 wlascicieli skorzystalo z generatora, aby uporzadkowac formalnosci bez
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
        <p>Z rozwiazania korzystaja wlasciciele mieszkan, operatorzy i zarzadcy najmu w calej Polsce</p>
        <div className="client-logos-grid">
          <span>Airbnb Host</span>
          <span>Booking Operator</span>
          <span>Zarzadca najmu</span>
          <span>Biuro obslugi</span>
        </div>
      </section>

      <section className="landing-section">
        <h2>Poznaj funkcje, ktore usprawnia Twoja prace</h2>
        <div className="info-grid">
          <article className="info-card">
            <h3>Weryfikacja obowiazku rejestracji</h3>
            <p>Quiz prowadzi przez kluczowe pytania i pokazuje rekomendowany dalszy krok.</p>
          </article>
          <article className="info-card">
            <h3>Generator pakietu dokumentow</h3>
            <p>Automatycznie tworzysz komplet dokumentow dla urzedu i dla potrzeb archiwizacji.</p>
          </article>
          <article className="info-card">
            <h3>Wyszukiwarka gmin i urzedow</h3>
            <p>Po wyborze lokalizacji otrzymujesz dane urzedu, BIP i rekomendowany sposob zlozenia.</p>
          </article>
          <article className="info-card">
            <h3>Raporty zgod RODO</h3>
            <p>Masz gotowy eksport zgod i historii operacji na potrzeby klienta lub UODO.</p>
          </article>
          <article className="info-card">
            <h3>Proces usuwania danych</h3>
            <p>Endpoint prawa do bycia zapomnianym anonimizuje dane i zapisuje slady audytowe.</p>
          </article>
          <article className="info-card">
            <h3>Szybkie wdrozenie</h3>
            <p>Aplikacja dziala od razu lokalnie i jest gotowa do dalszego rozwoju na Vercel.</p>
          </article>
        </div>
      </section>

      <section className="landing-section">
        <h2>Co zawiera pakiet</h2>
        <ul className="check-list">
          <li>Wniosek o wpis do rejestru obiektow krotkotrwalego zakwaterowania</li>
          <li>Oswiadczenie wlasciciela lokalu</li>
          <li>Regulamin lokalu dla gosci</li>
          <li>Wzor umowy najmu krotkoterminowego</li>
          <li>Checklista dokumentow wymaganych przez urzad</li>
          <li>Instrukcja krok po kroku: co zlozyc, gdzie i w jakiej kolejnosci</li>
        </ul>
        <p className="section-note">
          Pakiet jest generowany na podstawie Twoich odpowiedzi i gotowy do pobrania jako plik ZIP.
        </p>
      </section>

      <section className="landing-section">
        <h2>Jak to dziala</h2>
        <ol className="steps-list">
          <li>
            <strong>Krok 1:</strong> Odpowiadasz na 5 pytan i sprawdzasz, czy obowiazek
            rejestracji dotyczy Twojego przypadku.
          </li>
          <li>
            <strong>Krok 2:</strong> Uzupelniasz dane wlasciciela i lokalu, potrzebne do
            przygotowania dokumentow.
          </li>
          <li>
            <strong>Krok 3:</strong> Pobierasz paczke ZIP i skladasz dokumenty we wlasciwym
            urzedzie.
          </li>
        </ol>
      </section>

      <section className="landing-section dark-pricing">
        <h2>Dlaczego 399 zl</h2>
        <div className="pricing-compare">
          <article className="pricing-card pricing-card--muted">
            <h3>U prawnika</h3>
            <p>Najczesciej 300-800 zl za sama konsultacje i dodatkowy czas oczekiwania.</p>
          </article>
          <article className="pricing-card pricing-card--highlight">
            <h3>najembezkary.pl</h3>
            <p>
              Jedna oplata, gotowy pakiet dokumentow i jasna sciezka dalszych krokow od razu po
              wypelnieniu formularza.
            </p>
          </article>
        </div>
      </section>

      <section className="stats-grid">
        <article>
          <p className="stats-value">15 min</p>
          <p className="stats-label">sredni czas przygotowania pakietu</p>
        </article>
        <article>
          <p className="stats-value">6 dokumentow</p>
          <p className="stats-label">w jednej paczce ZIP</p>
        </article>
        <article>
          <p className="stats-value">24/7</p>
          <p className="stats-label">dostep do generatora online</p>
        </article>
        <article>
          <p className="stats-value">1 proces</p>
          <p className="stats-label">od quizu do pobrania dokumentow</p>
        </article>
      </section>

      <section className="landing-section dark-band">
        <h2>Przyspiesz formalnosci i ogranicz ryzyko bledow</h2>
        <p>
          Otrzymujesz uporzadkowany proces: od sprawdzenia obowiazku, przez uzupelnienie danych,
          po gotowe dokumenty i instrukcje zlozenia.
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
              Od tego zaczyna sie quiz. Po kilku pytaniach zobaczysz, czy prawdopodobnie podlegasz
              rejestracji i jaki wariant dokumentow wybrac.
            </p>
          </article>
          <article>
            <h3>Czy dokumenty sa zgodne z przepisami?</h3>
            <p>
              Szablony sa przygotowane pod aktualny model rejestracji, ale przed zlozeniem warto
              sprawdzic wymagania Twojej gminy (BIP i komunikaty lokalne).
            </p>
          </article>
          <article>
            <h3>Czy moge pobrac dokumenty wielokrotnie?</h3>
            <p>
              Tak, w okresie waznosci linku mozesz pobierac paczke ponownie. Zalecamy zapisanie
              plikow lokalnie po pierwszym pobraniu.
            </p>
          </article>
        </div>
        <p className="disclaimer">
          Serwis ma charakter informacyjny. Nie swiadczymy uslug prawnych, a dokumenty wymagaja
          weryfikacji przez uzytkownika przed zlozeniem.
        </p>
      </section>

      <section className="landing-section cta-final">
        <h2>Uprosc formalnosci i dzialaj od razu</h2>
        <p>
          Zacznij od quizu, aby sprawdzic obowiazek rejestracji i od razu przejsc do
          przygotowania dokumentow.
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
