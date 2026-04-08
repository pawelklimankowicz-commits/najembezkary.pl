import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności — najembezkary.pl",
};

export default function PolitykaPage() {
  return (
    <main className="page-shell legal">
      <h1 className="page-title">Polityka prywatności</h1>
      <p>
        Poniższy opis ma charakter szkicu. Należy go uzupełnić o faktycznych
        administratorów danych, podstawy prawne, okresy przechowywania, prawa osób,
        których dane dotyczą, oraz informacje o podmiotach przetwarzających dane w
        imieniu administratora.
      </p>
      <h2>Administrator</h2>
      <p>Podlega uzupełnieniu danymi prowadzącego serwis najembezkary.pl.</p>
      <h2>Zakres danych</h2>
      <p>
        W ramach kreatora formularza przetwarzane są dane wprowadzone przez użytkownika
        (np. dane kontaktowe, adres obiektu) wyłącznie w celu wygenerowania
        dokumentów po stronie serwera lub w przeglądarce, zgodnie z ustawieniami
        wdrożenia.
      </p>
      <h2>Prawa</h2>
      <p>
        Przysługuje prawo dostępu do danych, ich sprostowania, ograniczenia
        przetwarzania, usunięcia w zakresie przewidzianym przepisami RODO.
      </p>
    </main>
  );
}
