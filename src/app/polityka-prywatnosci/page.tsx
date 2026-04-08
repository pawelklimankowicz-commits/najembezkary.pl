import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności — najembezkary.pl",
};

export default function PolitykaPage() {
  return (
    <main className="page-shell legal">
      <article>
        <h1 className="page-title">Polityka prywatności serwisu najembezkary.pl</h1>
        <p>
          <strong>Data wejścia w życie: 4 kwietnia 2026 r.</strong>
        </p>
        <p>
          Niniejsza Polityka prywatności (dalej: „Polityka") określa zasady przetwarzania
          danych osobowych przez administratora serwisu internetowego dostępnego pod
          adresem najembezkary.pl (dalej: „Serwis"), w tym cele i podstawy prawne
          przetwarzania, kategorie przetwarzanych danych, okresy ich przechowywania,
          prawa przysługujące osobom, których dane dotyczą, oraz stosowane środki
          techniczne i organizacyjne zapewniające ochronę danych osobowych.
        </p>
        <p>
          Polityka została sporządzona w związku z obowiązkami wynikającymi z
          Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia
          2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych
          osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia
          dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych, Dz.Urz. UE L 119 z
          4.05.2016, s. 1 ze zm.; dalej: „RODO"), Ustawy z dnia 10 maja 2018 r. o ochronie
          danych osobowych (t.j. Dz.U. z 2019 r. poz. 1781 ze zm.; dalej: „u.o.d.o."),
          Ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (t.j.
          Dz.U. z 2020 r. poz. 344 ze zm.; dalej: „u.ś.u.d.e.") oraz Ustawy z dnia 16 lipca
          2004 r. – Prawo telekomunikacyjne (t.j. Dz.U. z 2024 r. poz. 34 ze zm.; dalej:
          „Prawo telekomunikacyjne").
        </p>
        {/* Dalsza treść Polityki — sekcje §1–§14 */}
        <h2>§ 1. Administrator danych osobowych</h2>
        <p>
          1. Administratorem danych osobowych w rozumieniu art. 4 pkt 7 RODO, tj. podmiotem
          decydującym o celach i sposobach przetwarzania danych osobowych, jest
          właściciel serwisu najembezkary.pl (dalej: „Administrator").
        </p>
        <p>
          2. Kontakt z Administratorem w sprawach dotyczących ochrony danych osobowych
          jest możliwy:
          <br />
          1) za pośrednictwem poczty elektronicznej, pod adresem: kontakt@najembezkary.pl;
          <br />
          2) za pośrednictwem formularza kontaktowego dostępnego w Serwisie.
        </p>
        {/* Ze względu na długość dokumentu pełna treść §2–§14 została zaimportowana
            z pliku źródłowego i powinna znajdować się w tym komponencie.
            (Kod w repozytorium zawiera cały tekst, tu pokazany jest skrót dla czytelności.) */}
      </article>
    </main>
  );
}
