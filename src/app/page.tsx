import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

const TOP_OPERATORS: Array<{ name: string; logo?: string }> = [
  { name: "OLX.pl", logo: "/logos/olx-pl.png" },
  { name: "Booking.com", logo: "/logos/booking-com.png" },
  { name: "Airbnb", logo: "/logos/airbnb.png" },
  { name: "Nieruchomosci-online.pl", logo: "/logos/nieruchomosci-online.png" },
  { name: "Morizon.pl", logo: "/logos/morizon.png" },
  { name: "Adresowo.pl", logo: "/logos/adresowo.png" },
  { name: "Domiporta.pl", logo: "/logos/domiporta.png" },
  { name: "Nocowanie.pl", logo: "/logos/nocowanie.png" },
  { name: "Gratka.pl", logo: "/logos/gratka.png" },
  { name: "Allegro", logo: "/logos/allegro.png" },
  { name: "Gumtree", logo: "/logos/gumtree.png" },
  { name: "Facebook", logo: "/logos/facebook.png" },
  { name: "Instagram", logo: "/logos/instagram.png" },
  { name: "Szybko.pl", logo: "/logos/szybko.png" },
  { name: "Mapawynajmu.pl", logo: "/logos/mapawynajmu.png" },
  { name: "Renters.pl", logo: "/logos/renters.png" },
  { name: "RentPlanet", logo: "/logos/rentplanet.png" },
  { name: "Rentujemy", logo: "/logos/rentujemy.png" },
  { name: "BookingHost", logo: "/logos/bookinghost.png" },
  { name: "M2Rent", logo: "/logos/m2rent.png" },
];

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
          </div>
          <div className="hero-countdown">
            <CountdownTimer />
          </div>
          <div className="hero-actions">
            <Link href="/quiz" className="btn-primary hero-cta">
              Sprawdź obowiązek i pobierz dokumenty
            </Link>
            <Link href="/przygotuj" className="btn-secondary hero-cta-secondary">
              Przejdź bezpośrednio do kreatora
            </Link>
          </div>
          <p className="hero-subline">
            Już ponad 1000 właścicieli skorzystało z generatora, aby wygenerować gotowy pakiet rejestracyjny.
            <br />
            Zaoszczędź swój cenny czas i nerwy.
          </p>
        </div>
      </section>

      <section id="jak-to-dziala" className="landing-section">
        <h2>Jak to działa</h2>
        <ul className="steps-list">
          <li>
            <strong>Krok 1:</strong> Odpowiadasz na serię pytań i sprawdzasz, czy obowiązek
            rejestracji dotyczy Twojego lokalu.
          </li>
          <li>
            <strong>Krok 2:</strong> Uzupełniasz dane właściciela i lokalu.
          </li>
          <li>
            <strong>Krok 3:</strong> Otrzymujesz komplet dokumentów, które składasz we
            właściwym urzędzie.
          </li>
        </ul>
      </section>

      <section className="landing-section">
        <h2>Co zawiera pakiet dokumentów</h2>
        <ul className="check-list">
          <li>Wniosek o wpis do rejestru obiektów krótkotrwałego zakwaterowania.</li>
          <li>Oświadczenie właściciela lokalu.</li>
          <li>Regulamin lokalu dla gości.</li>
          <li>Wzór umowy najmu krótkoterminowego.</li>
          <li>Checklista dokumentów wymaganych przez urząd.</li>
          <li>Instrukcja postępowania.</li>
        </ul>
      </section>

      <section className="landing-section cta-final">
        <h2>Uprość formalności i działaj od razu</h2>
        <p>
          Zacznij od ankiety, aby sprawdzić obowiązek rejestracji i od razu przejść do
          przygotowania dokumentów.
        </p>
        <p>
          <Link href="/quiz" className="btn-primary">
            Rozpocznij teraz
          </Link>
        </p>
      </section>

      <section className="landing-section">
        <h2>Poznaj funkcje, które usprawnią Twoją pracę</h2>
        <div className="info-grid">
          <article className="info-card">
            <h3>Weryfikacja obowiązku rejestracji</h3>
            <p>Ankieta prowadzi przez kluczowe pytania i pokazuje rekomendowany dalszy krok.</p>
          </article>
          <article className="info-card">
            <h3>Wyszukiwarka gmin i urzędów</h3>
            <p>Po wyborze lokalizacji otrzymujesz dane urzędu, BIP i rekomendowany sposób złożenia.</p>
          </article>
          <article className="info-card">
            <h3>Generator pakietu dokumentów</h3>
            <p>Automatycznie tworzysz komplet dokumentów dla urzędu i dla potrzeb archiwizacji.</p>
          </article>
        </div>
      </section>

      <section className="landing-section dark-pricing">
        <h2>Dlaczego 99 złotych to uczciwa cena ?</h2>
        <div className="pricing-compare">
          <article className="pricing-card pricing-card--muted">
            <h3>U prawnika</h3>
            <p>Średnio 499 złotych zł za samą konsultację inie mówiąc o czasie oczekiwania na przygotowanie dokumentów.</p>
          </article>
          <article className="pricing-card pricing-card--highlight">
            <h3>U nas</h3>
            <p>
              Jedna niska opłata, gotowy pakiet dokumentów i jasna ścieżka dalszych kroków od razu po
              wypełnieniu formularza.
            </p>
          </article>
        </div>
      </section>

      <section className="stats-grid">
        <article>
          <p className="stats-value">3 min</p>
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
          <p className="stats-value">1 intuicyjny proces</p>
          <p className="stats-label">od ankiety do pobrania dokumentów</p>
        </article>
      </section>

      <section className="client-logos">
        <p>20 największych operatorów najmu w Polsce</p>
        <div className="client-logos-grid">
          {TOP_OPERATORS.map((operator) => (
            <article key={operator.name} className="client-logo-item">
              {operator.logo ? (
                <Image
                  src={operator.logo}
                  alt={operator.name}
                  width={120}
                  height={34}
                  className="client-logo-image"
                />
              ) : (
                <div className="client-logo-icon" aria-hidden="true">
                  ◉
                </div>
              )}
              <span>{operator.name}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section dark-band">
        <h2>Przyspiesz formalności i ogranicz ryzyko błędów</h2>
        <p>
          Otrzymujesz uporządkowany proces: od sprawdzenia obowiązku, przez uzupełnienie danych,
          po gotowe dokumenty i instrukcje złożenia.
        </p>
        <p>
          <Link href="/quiz" className="btn-primary">
            Uruchom proces teraz
          </Link>
        </p>
      </section>

      <section id="faq" className="landing-section faq-section">
        <h2>FAQ</h2>
        <div className="faq-accordion">
          <details>
            <summary>Czy to dotyczy mojego mieszkania?</summary>
            <p>
              Od tego zaczyna się ankieta. Po kilku pytaniach zobaczysz, czy prawdopodobnie podlegasz
              rejestracji i jaki wariant dokumentów wybrać.
            </p>
          </details>
          <details>
            <summary>Czy dokumenty są zgodne z przepisami?</summary>
            <p>
              Szablony są przygotowane pod aktualny model rejestracji, ale przed złożeniem warto
              sprawdzić wymagania Twojej gminy (BIP i komunikaty lokalne).
            </p>
          </details>
          <details>
            <summary>Czy mogę pobrać dokumenty wielokrotnie?</summary>
            <p>
              Tak, w okresie ważności linku możesz pobierać paczkę ponownie. Zalecamy zapisanie
              plików lokalnie po pierwszym pobraniu.
            </p>
          </details>
          <details>
            <summary>Co dokładnie dostanę po opłaceniu zamówienia?</summary>
            <p>
              Otrzymasz gotowy pakiet dokumentów do zgłoszenia najmu krótkoterminowego, dopasowany do
              odpowiedzi z ankiety i danych lokalu.
            </p>
          </details>
          <details>
            <summary>Ile czasu zajmuje przygotowanie dokumentów?</summary>
            <p>
              W większości przypadków cały proces trwa kilka minut: od wypełnienia ankiety po pobranie
              kompletnego pakietu.
            </p>
          </details>
          <details>
            <summary>Czy muszę zakładać konto, aby skorzystać z usługi?</summary>
            <p>
              Nie, proces został zaprojektowany tak, abyś mógł szybko przejść od ankiety do pobrania
              dokumentów bez tworzenia rozbudowanego konta użytkownika.
            </p>
          </details>
          <details>
            <summary>Czy dokumenty mogę edytować po pobraniu?</summary>
            <p>
              Tak, możesz je uzupełniać i modyfikować przed złożeniem, jeśli wymaga tego Twoja sytuacja
              lub wytyczne urzędu.
            </p>
          </details>
          <details>
            <summary>Czy cena 99 zł jest jednorazowa?</summary>
            <p>
              Tak, to jednorazowa opłata za przygotowanie pakietu dokumentów dla wskazanego przypadku.
            </p>
          </details>
          <details>
            <summary>W jaki sposób otrzymam dokumenty?</summary>
            <p>
              Dokumenty pobierasz bezpośrednio ze strony po zakończeniu procesu. Zalecamy od razu
              zapisać je lokalnie na komputerze.
            </p>
          </details>
          <details>
            <summary>Czy mogę użyć pakietu dla kilku lokali?</summary>
            <p>
              Pakiet przygotowywany jest na podstawie danych jednego procesu. Dla kolejnego lokalu
              najlepiej przejść proces ponownie, aby zachować poprawność danych.
            </p>
          </details>
          <details>
            <summary>Czy system uwzględnia właściwy urząd dla mojego lokalu?</summary>
            <p>
              Tak, po wskazaniu lokalizacji otrzymujesz dane właściwego urzędu i podstawowe informacje,
              które pomagają w prawidłowym złożeniu dokumentów.
            </p>
          </details>
          <details>
            <summary>Czy mogę skonsultować dokumenty z prawnikiem?</summary>
            <p>
              Oczywiście. Wielu użytkowników traktuje pakiet jako bazę, którą następnie weryfikuje
              dodatkowo z doradcą prawnym.
            </p>
          </details>
          <details>
            <summary>Co jeśli popełnię błąd w danych?</summary>
            <p>
              Najlepiej poprawić dane przed ostatecznym złożeniem w urzędzie. W razie potrzeby możesz
              wygenerować dokumenty ponownie na podstawie poprawionych informacji.
            </p>
          </details>
          <details>
            <summary>Czy usługa działa na telefonie?</summary>
            <p>
              Tak, serwis jest responsywny i działa na urządzeniach mobilnych, ale dla wygody pracy z
              dokumentami rekomendujemy komputer.
            </p>
          </details>
          <details>
            <summary>Skąd mam wiedzieć, że dokumenty są kompletne?</summary>
            <p>
              W pakiecie otrzymujesz checklistę oraz instrukcję postępowania, które pomagają upewnić
              się, że niczego nie brakuje przed wizytą w urzędzie.
            </p>
          </details>
        </div>
      </section>

    </main>
  );
}
