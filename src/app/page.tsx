import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-[#FDF0F0] to-white pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-[#C0392B] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
                Nowe przepisy — termin 20 maja 2026
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Od 20 maja 2026 najem krotkoterminowy{" "}
                <span className="text-[#C0392B]">wymaga rejestracji</span>
              </h1>

              <div className="border-l-4 border-[#C0392B] pl-4 mb-6">
                <p className="text-gray-600 text-lg">
                  Brak rejestracji = <strong className="text-[#C0392B]">kara do 50 000 zl</strong>.
                  Przygotuj dokumenty w 15 minut.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/quiz"
                  className="bg-[#C0392B] hover:bg-[#A93226] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 text-center"
                >
                  Sprawdz obowiazek i pobierz dokumenty →
                </Link>
              </div>

              <div className="inline-flex items-center gap-2 bg-[#E8B84B]/15 border border-[#E8B84B] text-[#7D5C00] text-sm font-medium px-4 py-2 rounded-full">
                <span>✓</span>
                399 zl — jednorazowo • Dokumenty gotowe w 5 minut
              </div>
            </div>

            <div className="lg:flex lg:justify-end">
              <div className="w-full max-w-sm">
                <CountdownTimer />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section max-w-6xl mx-auto px-4">
        <h2>Dla kogo</h2>
        <ul>
          <li>Wlasciciele wynajmujacy przez Airbnb</li>
          <li>Wlasciciele wynajmujacy przez Booking.com</li>
          <li>Operatorzy kilku mieszkan</li>
        </ul>
      </section>

      <section className="landing-section max-w-6xl mx-auto px-4">
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

      <section className="landing-section max-w-6xl mx-auto px-4">
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
