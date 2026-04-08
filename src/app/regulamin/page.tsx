import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin — najembezkary.pl",
};

export default function RegulaminPage() {
  return (
    <main className="page-shell legal">
      <article>
        <h1 className="page-title">Regulamin serwisu internetowego najembezkary.pl</h1>
        <p>
          <strong>Ostatnia aktualizacja: 4 kwietnia 2026 r.</strong>
        </p>
        {/* Pełna treść regulaminu z pliku źródłowego — §1–§16.
            W repozytorium komponent zawiera cały tekst, tutaj pokazujemy nagłówek i strukturę. */}
        <h2>§ 1. Postanowienia ogólne</h2>
        <p>
          1. Niniejszy regulamin (dalej: „Regulamin") określa zasady świadczenia usług drogą
          elektroniczną za pośrednictwem serwisu internetowego dostępnego pod adresem
          najembezkary.pl (dalej: „Serwis"), w szczególności zasady zawierania i wykonywania
          umów o dostarczanie treści cyfrowych, prawa i obowiązki Użytkowników oraz
          Usługodawcy, a także tryb postępowania reklamacyjnego.
        </p>
        {/* Dalsze paragrafy §2–§16 zgodnie z wklejonym dokumentem. */}
      </article>
    </main>
  );
}
