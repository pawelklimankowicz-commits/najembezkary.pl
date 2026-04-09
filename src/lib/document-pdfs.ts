import type { jsPDF } from "jspdf";
import JSZip from "jszip";

import { createPolishPdf } from "@/lib/jspdf-polish";
import * as L from "@/lib/pdf-layout";

/** Kontekst wypełnienia dokumentów (dane z formularza + zamówienia + quizu). */
export type PdfContext = {
  ownerName: string;
  ownerCity: string;
  ownerAddr: string;
  ownerZip: string;
  ownerPesel: string;
  ownerEmail: string;
  ownerPhone: string;
  /** Seria i nr dowodu / paszportu lub „—”. */
  idDocument: string;
  propAddr: string;
  propCity: string;
  propZip: string;
  propType: string;
  propAreaM2: string;
  propFloor: string;
  listingName: string;
  platformsLine: string;
  rentalSinceYear: string;
  /** Grupa gości z quizu (q3). */
  guestGroupLabel: string;
  officeName: string;
  officeAddress: string;
  officeBipUrl: string;
  today: string;
};

const x = () => L.PDF.marginX;
const w = () => L.PDF.contentW;

function finishDoc(doc: jsPDF, zip: JSZip, fileName: string): void {
  L.addPageNumbers(doc);
  zip.file(fileName, doc.output("arraybuffer"));
}

/** 1 — Wniosek o wpis do rejestru */
function build1(doc: jsPDF, c: PdfContext): void {
  L.setMeta(doc, {
    title: "Wniosek o wpis do rejestru obiektów krótkotrwałego zakwaterowania",
  });
  let y = L.PDF.marginY;
  y = L.writeDocTitle(
    doc,
    [
      "WNIOSEK O WPIS DO REJESTRU",
      "OBIEKTÓW KRÓTKOTRWAŁEGO ZAKWATEROWANIA",
    ],
    y,
    13,
    1.2
  );

  y = L.writeRule(doc, y - 4.2);
  const w1 = { gapBefore: 0.05, gapAfter: 0.05 } as const;
  const w1next = { gapBefore: 0.05, gapAfter: 0.05 } as const;
  const w1p = [9.5, 1.15, "left" as const, 0] as const;

  y = L.writeSectionHeading(
    doc,
    "I. Dane wnioskodawcy (właściciel / posiadacz prawa)",
    x(),
    y,
    11,
    w1
  );
  y = L.writeParagraphFlow(
    doc,
    `Imię i nazwisko lub nazwa: ${c.ownerName}\nAdres do korespondencji: ${c.ownerAddr}, ${c.ownerZip} ${c.ownerCity}\nNumer PESEL / NIP (jeśli dotyczy): ${c.ownerPesel}\nDokument tożsamości (seria i numer dowodu lub paszportu): ${c.idDocument}\nAdres e-mail kontaktowy: ${c.ownerEmail}\nNumer telefonu: ${c.ownerPhone}`,
    x(),
    y,
    w(),
    ...w1p
  );

  y = L.writeSectionHeading(
    doc,
    "II. Dane obiektu (lokal świadczący usługi zakwaterowania)",
    x(),
    y,
    11,
    w1next
  );
  y = L.writeParagraphFlow(
    doc,
    `Adres obiektu: ${c.propAddr}, ${c.propZip} ${c.propCity}\nRodzaj obiektu / lokalu: ${c.propType}\nPowierzchnia użytkowa (orientacyjnie): ${c.propAreaM2}\nPiętro: ${c.propFloor}\nSposób udostępniania (np. w całości, pokoje, część lokalu) / nazwa w ogłoszeniu: ${c.listingName}\nSzacowana liczba miejsc noclegowych (łóżek / miejsc): — (uzupełnij wg wyposażenia)\nPrzewidywana liczba osób jednocześnie przebywających w obiekcie (wg quizu): ${c.guestGroupLabel}\nKanały rezerwacji (platformy / bezpośrednio): ${c.platformsLine}\nRok rozpoczęcia wynajmu krótkoterminowego (wg formularza): ${c.rentalSinceYear}`,
    x(),
    y,
    w(),
    ...w1p
  );

  y = L.writeSectionHeading(doc, "III. Treść wniosku", x(), y, 11, w1next);
  y = L.writeParagraphFlow(
    doc,
    "Wnoszę o dokonanie wpisu przedmiotowego obiektu do rejestru obiektów krótkotrwałego zakwaterowania prowadzonego przez właściwy organ gminy (miasta) oraz o wydanie decyzji potwierdzającej nadanie numeru rejestracyjnego obiektu, jeżeli przepisy przewidują taki tryb.",
    x(),
    y,
    w(),
    ...w1p
  );

  y = L.writeSectionHeading(doc, "IV. Oświadczenia wnioskodawcy", x(), y, 11, w1next);
  y = L.writeParagraphFlow(
    doc,
    "1) Oświadczam, że dane zawarte we wniosku są zgodne z prawdą i zostały podane dobrowolnie.\n2) Oświadczam, że posiadam tytuł prawny do dysponowania lokalem w zakresie niezbędnym do świadczenia usług zakwaterowania (np. własność, współwłasność, umowa najmu, zarząd).\n3) Zobowiązuję się do przestrzegania przepisów prawa budowlanego, sanitarnego, przeciwpożarowego oraz przepisów o ochronie praw mieszkańców i porządku publicznego.\n4) Zobowiązuję się do aktualizacji danych w rejestrze w przypadku istotnych zmian dotyczących obiektu lub sposobu jego udostępniania.\n5) Przyjmuję do wiadomości, że podanie nieprawdy lub wprowadzenie w błąd organ może wiązać się z konsekwencjami prawnymi przewidzianymi w przepisach powszechnie obowiązujących.",
    x(),
    y,
    w(),
    ...w1p
  );

  y = L.writeSectionHeading(doc, "V. Klauzula informacyjna (RODO) — skrót", x(), y, 11, w1next);
  y = L.writeParagraphFlow(
    doc,
    "Administratorem danych osobowych jest organ gminy (miasta) przyjmujący wniosek. Dane przetwarzane są w celu prowadzenia rejestru i realizacji zadań publicznych. Posiada Pani/Pan prawo dostępu do danych, ich sprostowania, ograniczenia przetwarzania, wniesienia sprzeciwu w zakresie przewidzianym prawem oraz prawo wniesienia skargi do organu nadzorczego (PUODO). Szczegóły zawiera informacja udostępniana przez urząd przy przyjęciu dokumentów.",
    x(),
    y,
    w(),
    ...w1p
  );

  y = L.ensureSpace(doc, y, 18);
  y = L.writeParagraphFlow(
    doc,
    `Miejscowość i data: ${c.ownerCity}, ${c.today}\nPodpis wnioskodawcy\n..............................................................\n(czytelny podpis lub podpis elektroniczny, jeżeli składane elektronicznie)`,
    x(),
    y,
    w(),
    ...w1p
  );

  y = L.writeParagraphFlow(
    doc,
    "Załączniki:\n- kopia dokumentu potwierdzającego prawo do lokalu,\n- kopia dokumentu tożsamości,\n- inne dokumenty wymagane przez właściwą gminę.",
    x(),
    y,
    w(),
    ...w1p
  );
}

/** 2 — Oświadczenie właściciela (1 strona: zwarte odstępy, data w prawym górnym rogu, podpis po prawej) */
function build2(doc: jsPDF, c: PdfContext): void {
  L.setMeta(doc, { title: "Oświadczenie właściciela lokalu — najem krótkoterminowy" });
  L.writeDatePlaceTopRight(doc, c.propCity, c.today);
  let y = L.PDF.marginY + 8;
  y = L.writeDocTitle(
    doc,
    ["OŚWIADCZENIE WŁAŚCICIELA", "LOKALU ŚWIADCZĄCEGO USŁUGI ZAKWATEROWANIA"],
    y,
    11,
    5,
    true
  );

  const b2 = [10, 1.42, "left" as const, 2.4] as const;
  const h2 = { gapBefore: 1.2, gapAfter: 1.6 } as const;

  y = L.writeParagraphFlow(
    doc,
    `Ja, niżej podpisany/a ${c.ownerName}, zamieszkały/a pod adresem: ${c.ownerAddr}, ${c.ownerZip} ${c.ownerCity}, legitymujący/a się dokumentem tożsamości seria i nr: ${c.idDocument}, PESEL: ${c.ownerPesel}.`,
    x(),
    y,
    w(),
    ...b2
  );

  y = L.writeSectionHeading(doc, "Oświadczam, co następuje:", x(), y, 9.5, h2);

  const points = [
    `1) Posiadam prawo własności lub inne prawo pozwalające na udostępnianie lokalu znajdującego się pod adresem: ${c.propAddr}, ${c.propZip} ${c.propCity} — typ lokalu: ${c.propType}.`,
    "2) Lokal spełnia wymagania w zakresie bezpieczeństwa, higieny i ochrony przeciwpożarowej w zakresie wymaganym dla danego rodzaju obiektu; zobowiązuję się do utrzymania lokalu w stanie pozwalającym na bezpieczne korzystanie przez gości.",
    "3) Wyrażam zgodę na przeprowadzenie czynności kontrolnych przez organy uprawnione na podstawie przepisów prawa, w tym kontroli sanitarnej i przeciwpożarowej, zgodnie z harmonogramem i trybem przewidzianym w przepisach.",
    "4) Prowadzę lub zamierzam prowadzić najem krótkoterminowy zgodnie z definicją obowiązującą w przepisach o rejestracji obiektów krótkotrwałego zakwaterowania i będę zamieszczać numer rejestracyjny obiektu w ofertach i ogłoszeniach, jeżeli wymagają tego przepisy.",
    "5) Przyjmuję odpowiedzialność za szkody wyrządzone przez gości w zakresie przewidzianym przepisami prawa cywilnego oraz zobowiązuję się do przestrzegania regulaminu wynajmu i zasad współżycia w budynku i społeczności lokalnej.",
    "6) Zostałem/am pouczony/a, że za złożenie fałszywego oświadczenia grożą sankcje przewidziane w Kodeksie karnym oraz w innych ustawach.",
  ];

  for (const p of points) {
    y = L.ensureSpace(doc, y, 18);
    y = L.writeParagraphFlow(doc, p, x(), y, w(), ...b2);
  }

  y = L.ensureSpace(doc, y, 20);
  y = L.writeSignatureBlockRight(doc, y, [
    "Podpis oświadczającego/a",
    "..............................................................",
  ]);
}

/** 3 — Regulamin lokalu (treść wyśrodkowana; nagłówki § + tytuły: pogrubienie, +1 pt względem korpusu) */
function build3(doc: jsPDF, c: PdfContext): void {
  L.setMeta(doc, { title: "Regulamin korzystania z lokalu — najem krótkoterminowy" });
  let y = L.PDF.marginY;
  const bodyFs = 10;
  const headFs = 12;
  y = L.writeDocTitle(
    doc,
    ["REGULAMIN KORZYSTANIA Z LOKALU", `Adres obiektu: ${c.propAddr}, ${c.propZip} ${c.propCity}`],
    y,
    headFs,
    10,
    true
  );

  y = L.writeParagraphFlow(
    doc,
    "Niniejszy regulamin określa zasady korzystania z lokalu w ramach najmu krótkoterminowego (wynajem na doby lub krótszy cykl, zgodnie z ofertą). Korzystając z rezerwacji, gość akceptuje postanowienia regulaminu.",
    x(),
    y,
    w(),
    bodyFs,
    1.45,
    "center",
    3.5,
    "normal"
  );

  const sections: { num: string; title: string; b: string }[] = [
    {
      num: "§ 1.",
      title: "Przedmiot i zakres",
      b: "Przedmiotem najmu jest lokal wskazany w adresie powyżej, udostępniany w celach mieszkaniowych turystycznych. Wyposażenie obejmuje urządzenia i meble w stanie zgodnym z opisem oferty. Gość zobowiązuje się korzystać z lokalu zgodnie z przeznaczeniem i instrukcją eksploatacji urządzeń (np. klimatyzacja, kuchenka, zmywarka).",
    },
    {
      num: "§ 2.",
      title: "Zameldowanie i wymeldowanie",
      b: "Standardowe godziny zameldowania (check-in) i wymeldowania (check-out) wynoszą od 15:00 do 11:00, o ile oferta nie stanowi inaczej. Inne godziny wymagają wcześniejszej zgody wynajmującego. Przy odbiorze kluczy gość potwierdza stan lokalu; zastrzeżenia należy zgłosić niezwłocznie.",
    },
    {
      num: "§ 3.",
      title: "Liczba osób i goście",
      b: "Maksymalna liczba osób przebywających w lokalu nie może przekraczać liczby wskazanej w rezerwacji. Organizowanie imprez, spotkań o charakterze komercyjnym lub udział osób trzecich bez zgody wynajmującego jest niedopuszczalny, chyba że strony uzgodnią inaczej na piśmie.",
    },
    {
      num: "§ 4.",
      title: "Porządek, hałas i współżycie",
      b: "Obowiązuje dobro sąsiadów i cisza nocna w godzinach 22:00–6:00. Zakazuje się hałaśliwego zachowania, używania lokalu w sposób uciążliwy dla innych mieszkańców budynku oraz naruszania regulaminu wspólnoty lub spółdzielni.",
    },
    {
      num: "§ 5.",
      title: "Palenie i substancje",
      b: "W lokalu obowiązuje zakaz palenia tytoniu, e-papierosów i stosowania otwartego ognia. Zabronione jest również przechowywanie materiałów niebezpiecznych lub łatwopalnych bez zgody wynajmującego.",
    },
    {
      num: "§ 6.",
      title: "Zwierzęta",
      b: "Przyjazd ze zwierzętami wymaga wcześniejszej zgody i może wiązać się z dodatkową opłatą. Gość ponosi odpowiedzialność za szkody i zanieczyszczenia powstałe w związku z pobytem zwierząt.",
    },
    {
      num: "§ 7.",
      title: "Sprzątanie i utrzymanie czystości",
      b: "Gość zobowiązuje się utrzymywać lokal w stanie zasadniczo czystym, usuwać śmieci zgodnie z zasadami segregacji, pozostawić naczynia w stanie uporządkowanym (jeśli obowiązuje zasada z kuchni). Gruntowne sprzątanie końcowe wykonuje się według zasad oferty.",
    },
    {
      num: "§ 8.",
      title: "Szkody, kaucja i odpowiedzialność",
      b: "Gość ponosi odpowiedzialność za szkody wyrządzone w lokalu, urządzeniach i wyposażeniu, powstałe z jego winy lub winy osób przez niego zaproszonych. Wynajmujący może pobrać kaucję lub potrącić koszty napraw zgodnie z umową i dokumentacją zdjęciową.",
    },
    {
      num: "§ 9.",
      title: "Awarie i bezpieczeństwo",
      b: "W razie awarii (woda, prąd, gaz, brak klucza) gość niezwłocznie informuje wynajmującego lub wskazaną osobę kontaktową. W sytuacji zagrożenia życia lub mienia obowiązuje wezwanie służb (112, straż, pogotowie) oraz powiadomienie wynajmującego.",
    },
    {
      num: "§ 10.",
      title: "Klucze i zabezpieczenie",
      b: "Klucze i karty dostępu wydaje się na czas pobytu. Zgubienie lub niezwrócenie kluczy może skutkować opłatą za wymianę zamków lub dodatkowe klucze. Przy wyjściu należy zamknąć drzwi i sprawdzić okna.",
    },
    {
      num: "§ 11.",
      title: "RODO i monitoring",
      b: "Dane osobowe gościa przetwarzane są w celu realizacji najmu, rozliczeń i ewentualnych roszczeń. Jeśli w budynku lub przy wejściu znajduje się monitoring, obowiązują przepisy o ochronie danych i oznakowaniu.",
    },
    {
      num: "§ 12.",
      title: "Postanowienia końcowe",
      b: "W sprawach nieuregulowanych zastosowanie mają przepisy Kodeksu cywilnego, umowa najmu oraz przepisy szczególne. Spory strony zobowiązują się rozstrzygać polubownie; sądem właściwym jest sąd powszechny według przepisów o właściwości.",
    },
  ];

  for (const s of sections) {
    y = L.ensureSpace(doc, y, 45);
    y = L.writeParagraphFlow(
      doc,
      `${s.num}\n\n${s.title}`,
      x(),
      y,
      w(),
      headFs,
      1.35,
      "center",
      1.8,
      "bold"
    );
    y = L.writeParagraphFlow(
      doc,
      s.b,
      x(),
      y,
      w(),
      bodyFs,
      1.45,
      "center",
      3.2,
      "normal"
    );
  }

  y = L.writeParagraphFlow(
    doc,
    `Regulamin obowiązuje od dnia: ${c.today}\nWynajmujący: ${c.ownerName}\nKontakt: ${c.ownerEmail}, ${c.ownerPhone}`,
    x(),
    y,
    w(),
    bodyFs,
    1.45,
    "center",
    3.2,
    "normal"
  );
}

/** 4 — Wzór umowy najmu krótkoterminowego (nagłówki §: pogrubienie, +1 pt; korpus zwarty) */
function build4(doc: jsPDF, c: PdfContext): void {
  L.setMeta(doc, { title: "Wzór umowy najmu krótkoterminowego" });
  L.writeDatePlaceTopRight(doc, c.ownerCity, c.today);

  const bodyFs = 10;
  const headFs = 12;
  const center = "center" as const;
  const wBody = [bodyFs, 1.38, center, 2.8, "normal" as const] as const;
  const wHead = [headFs, 1.35, center, 1.8, "bold" as const] as const;

  let y = L.PDF.marginY + 11;
  y = L.writeDocTitle(doc, ["UMOWA NAJMU KRÓTKOTERMINOWEGO"], y, headFs, 8, true);

  y = L.writeParagraphFlow(
    doc,
    "Strony zawierają umowę najmu krótkoterminowego (najem okazjonalny na wskazany okres), z zastrzeżeniem, że ostateczny kształt postanowień powinien być skonsultowany z doradcą prawnym w przypadku nietypowych warunków lub najmu komercyjnego.",
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 1.\n\nStrony umowy", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    `Wynajmujący: ${c.ownerName}, zamieszkały/a: ${c.ownerAddr}, ${c.ownerZip} ${c.ownerCity}, legitymujący/a się dowodem osobistym / paszportem nr: ${c.idDocument}, PESEL: ${c.ownerPesel}\n\nNajemca: .....................................................................\nAdres zamieszkania Najemcy: ................................................\nDokument tożsamości Najemcy: ................................................`,
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 2.\n\nPrzedmiot najmu", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    `Przedmiotem najmu jest lokal położony pod adresem: ${c.propAddr}, ${c.propZip} ${c.propCity}, o charakterze: ${c.propType}, powierzchnia ok.: ${c.propAreaM2}, piętro: ${c.propFloor}, wraz z wyposażeniem wymienionym w protokole zdawczo-odbiorczym lub opisie oferty (${c.listingName}).`,
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 3.\n\nOkres najmu", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    "Najem zostaje zawarty na czas oznaczony od godziny ………… dnia ………… do godziny ………… dnia …………, zgodnie z potwierdzeniem rezerwacji. Przedłużenie wymaga pisemnej lub elektronicznej zgody Wynajmującego.",
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 4.\n\nCzynsz i rozliczenia", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    "1) Czynsz za cały okres najmu wynosi: ……………… zł brutto / netto (zaznaczyć), płatny przelewem / gotówką / płatnością elektroniczną, nie później niż w terminie ……………….\n2) Kaucja zwrotna w wysokości ……………… zł płatna przy zameldowaniu; podlega rozliczeniu w ciągu … dni po zakończeniu najmu, po sprawdzeniu stanu lokalu.\n3) Opłaty eksploatacyjne wliczone w cenę / rozliczane według zużycia (zaznaczyć właściwe).",
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 5.\n\nObowiązki Najemcy", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    "Najemca zobowiązuje się: korzystać z lokalu zgodnie z przeznaczeniem; przestrzegać regulaminu lokalu i zasad wspólnoty; nie przekraczać uzgodnionej liczby osób; zwrócić lokal w stanie niepogorszonym z wyjątkiem zużycia normalnego; zgłaszać awarie; nie dokonywać przeróbek bez zgody Wynajmującego.",
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 6.\n\nObowiązki Wynajmującego", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    "Wynajmujący zobowiązuje się wydać lokal w stanie przydatnym do umówionego użytkowania oraz zapewnić funkcjonowanie podstawowych instalacji zgodnie z opisem oferty, z zastrzeżeniem awarii niezależnych od Wynajmującego.",
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 7.\n\nOdpowiedzialność i odstąpienie", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    "Strony odpowiadają za niewykonanie lub nienależyte wykonanie zobowiązań umownych na zasadach ogólnych Kodeksu cywilnego. Odstąpienie od umowy może nastąpić w przypadkach przewidzianych przepisami lub w uzgodnionych przypadkach (np. rażące naruszenie regulaminu).",
    x(),
    y,
    w(),
    ...wBody
  );

  y = L.writeParagraphFlow(doc, "§ 8.\n\nPostanowienia końcowe", x(), y, w(), ...wHead);
  y = L.writeParagraphFlow(
    doc,
    "Zmiany umowy wymagają formy pisemnej pod rygorem nieważności, o ile przepis szczególny nie stanowi inaczej. W sprawach nieuregulowanych mają zastosowanie przepisy KC. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach.\n\nPodpis Wynajmującego ................................    Podpis Najemcy ................................",
    x(),
    y,
    w(),
    ...wBody
  );
}

/** 5 — Checklista do urzędu */
function build5(doc: jsPDF, c: PdfContext): void {
  L.setMeta(doc, { title: "Checklista dokumentów — rejestr najmu krótkoterminowego" });
  let y = L.PDF.marginY;
  y = L.writeDocTitle(
    doc,
    ["CHECKLISTA DOKUMENTÓW DO URZĘDU", "Rejestracja obiektów krótkotrwałego zakwaterowania"],
    y,
    13
  );

  y = L.writeParagraphFlow(
    doc,
    "Lista ma charakter pomocniczy — ostateczny katalog dokumentów i druków urzędowych może się różnić w zależności od gminy i aktualnych jednolitych wzorów. Przed wizytą warto zadzwonić do referatu lub sprawdzić stronę BIP urzędu.",
    x(),
    y,
    w()
  );

  y = L.writeSectionHeading(doc, "Dokumenty typowe (zaznacz w kratce po przygotowaniu)", x(), y);
  const items = [
    "Wniosek o wpis do rejestru (wypełniony, podpisany) — wg załączonego wzoru lub wzoru urzędu.",
    "Oświadczenie właściciela / posiadacza prawa do lokalu — potwierdzające prawo dysponowania lokalem.",
    "Kopia dokumentu potwierdzającego tytuł prawny do lokalu (np. akt notarialny, wypis z księgi wieczystej, umowa najmu jeśli wynajmujesz jako podnajemca — zgodnie z sytuacją prawną).",
    "Dokument tożsamości właściciela (kopia dowodu osobistego lub paszportu — czasem wymagany oryginał do okazania).",
    "Numer NIP — jeśli prowadzisz działalność gospodarczą lub jest wymagany w danym trybie składania dokumentów.",
    "Zdjęcia obiektu / szkic — jeżeli urząd prowadzi rejestr z oznaczeniem obiektu na mapie lub wymaga dokumentacji fotograficznej.",
    "Potwierdzenie opłaty skarbowej lub informacja o zwolnieniu — zgodnie z obowiązującymi stawkami w danej gminie.",
    "Pełnomocnictwo — jeśli dokumenty składa osoba trzecia.",
  ];

  for (const item of items) {
    y = L.writeChecklistItem(doc, item, x(), y, w());
  }

  y = L.writeRule(doc, y);
  doc.addPage();
  L.setBodyFont(doc);
  y = L.PDF.marginY;
  y = L.writeSectionHeading(doc, "Gdzie złożyć dokumenty", x(), y, 11, {
    gapBefore: 0,
    gapAfter: 2.5,
  });
  y = L.writeParagraphFlow(
    doc,
    `Właściwy organ pod względem miejsca położenia obiektu: Urząd Gminy / Urząd Miasta właściwy dla adresu lokalu: ${c.propAddr}, ${c.propZip} ${c.propCity}.\nTypowo: Wydział gospodarki komunalnej, promocji, turystyki lub obsługi przedsiębiorców — nazwa referatu różni się między urzędami.`,
    x(),
    y,
    w(),
    10,
    1.5,
    "left",
    3.5
  );

  y = L.writeSectionHeading(doc, "Terminy i kontakt", x(), y, 11, {
    gapBefore: 2,
    gapAfter: 1,
  });
  y = L.writeParagraphFlow(
    doc,
    "Termin wpisu do rejestru uzależniony jest od wejścia w życie przepisów wykonawczych i uruchomienia rejestru w danej gminie — sprawdź komunikaty urzędu. W razie wątpliwości skontaktuj się z infolinią urzędu lub złoż zapytanie na piśmie / przez ePUAP.",
    x(),
    y,
    w(),
    10,
    1.5,
    "left",
    4
  );

  const disclaimer = `Materiał pomocniczy przygotowany przez serwis ${L.SITE_URL} — data: ${c.today}. Nie stanowi porady prawnej.`;
  L.ensureSpaceForBottomDisclaimer(doc, y, disclaimer);
  L.writeBottomDisclaimer(doc, disclaimer);
}

/** 6 — Instrukcja krok po kroku (ściśnięte odstępy; linia generacji — na samym dole, −2 pt wzgl. 7 pt) */
function build6(doc: jsPDF, c: PdfContext): void {
  L.setMeta(doc, { title: "Instrukcja rejestracji najmu krótkoterminowego" });
  let y = L.PDF.marginY;
  const instIntro = [10, 1.32, "left" as const, 3.2, "bold" as const] as const;
  const instStep = [10, 1.32, "left" as const, 2.8, "bold" as const] as const;
  const instHead = [11.5, 1.2, "left" as const, 1.5, "bold" as const] as const;

  y = L.writeDocTitle(
    doc,
    ["INSTRUKCJA", "REJESTRACJI NAJMU KRÓTKOTERMINOWEGO — KROK PO KROKU"],
    y,
    13,
    3.5,
    true
  );

  y = L.writeParagraphFlow(
    doc,
    "Poniższa ścieżka ułatwia uporządkowanie czynności przed wizytą w urzędzie i po uzyskaniu numeru rejestracyjnego. Dostosuj ją do komunikatów Twojej gminy i aktualnych przepisów.",
    x(),
    y,
    w(),
    ...instIntro
  );

  const steps: { n: string; t: string }[] = [
    {
      n: "Krok 1 — Potwierdź obowiązek rejestracji",
      t: `Sprawdź w generatorze / quizie na ${L.SITE_URL} lub w przepisach, czy Twój przypadek podlega wpisowi do rejestru. Zapisz typ rejestracji (pełna / uproszczona / wyłączenie), aby dobrać dokumenty.`,
    },
    {
      n: "Krok 2 — Zidentyfikuj właściwy urząd",
      t: `Urzad wlasciwy dla adresu obiektu: ${c.officeName}. Adres: ${c.officeAddress}. Dla lokalu ${c.propAddr}, ${c.propZip} ${c.propCity} potwierdz wlasciwy referat (turystyka / przedsiebiorczosc / promocja).`,
    },
    {
      n: "Krok 3 — Pobierz aktualne druki",
      t: `Wejdz na strone BIP urzedu: ${c.officeBipUrl}. Sprawdz jednolite wzory i sposob zlozenia (osobiscie / ePUAP / poczta). Jesli gmina akceptuje wlasny formularz, uzyj zalaczonego w pakiecie wniosku.`,
    },
    {
      n: "Krok 4 — Uzupełnij dane lokalu i właściciela",
      t: `Zestaw z formularza: właściciel ${c.ownerName}, kontakt ${c.ownerEmail}, tel. ${c.ownerPhone}, adres lokalu ${c.propAddr}, ${c.propZip} ${c.propCity}, typ ${c.propType}, pow. ${c.propAreaM2}, piętro ${c.propFloor}, kanały: ${c.platformsLine}, rok rozpoczęcia najmu: ${c.rentalSinceYear}. Przygotuj kopie dokumentów potwierdzających prawo do lokalu oraz tożsamość.`,
    },
    {
      n: "Krok 5 — Złóż komplet w urzędzie lub online",
      t: "Jeśli urząd przyjmuje dokumenty elektronicznie (ePUAP, skrzynka podawcza), przygotuj podpis zaufany / kwalifikowany zgodnie z wymaganiami. Przy składaniu osobistym zabierz oryginały do okazji.",
    },
    {
      n: "Krok 6 — Opłać opłatę skarbową (jeśli wymagana)",
      t: "Potwierdź wysokość opłaty i sposób wpłaty (np. kasa urzędu, przelew z tytułem). Zachowaj dowód wpłaty.",
    },
    {
      n: "Krok 7 — Odbierz decyzję lub potwierdzenie wpisu",
      t: "Zanotuj nadany numer rejestracyjny obiektu i sposób jego publikacji (np. na stronie gminy).",
    },
    {
      n: "Krok 8 — Uaktualnij ogłoszenia",
      t: "Dodaj numer rejestracyjny do ofert na platformach OTA (Airbnb, Booking, Flatio itp.) oraz w bezpośredniej komunikacji z gośćmi, zgodnie z wymaganiami prawa i regulaminów platform.",
    },
    {
      n: "Krok 9 — Archiwizacja",
      t: "Przechowuj kopie złożonych dokumentów i korespondencji z urzędem (PDF/zdjęcia). Ułatwi to ewentualne kontrole lub zmiany danych.",
    },
    {
      n: "Krok 10 — Aktualizacje i zmiany",
      t: "Przy zmianie adresu, liczby miejsc lub sposobu wynajmu sprawdź, czy wymagane jest zgłoszenie aktualizacyjne do urzędu.",
    },
  ];

  for (const s of steps) {
    y = L.ensureSpace(doc, y, 26);
    y = L.writeParagraphFlow(doc, s.n, x(), y + 1.6, w(), ...instHead);
    y = L.writeParagraphFlow(doc, s.t, x(), y, w(), ...instStep);
  }

  const genLine = `Dokument wygenerowany automatycznie z danymi z formularza: właściciel ${c.ownerName}, lokal ${c.propAddr}, ${c.propZip} ${c.propCity}, ${c.today}.`;
  const footerPt = 5;
  L.ensureSpaceForBottomDisclaimer(doc, y, genLine, footerPt);
  L.writeBottomDisclaimer(doc, genLine, footerPt, 3);
}

/**
 * @param folderPrefix — opcjonalny prefiks ścieżki w ZIP, np. `Lokal_nr_1` (bez ukośnika na końcu).
 */
export function appendAllPdfDocuments(
  zip: JSZip,
  ctx: PdfContext,
  folderPrefix = ""
): void {
  const prefix = folderPrefix
    ? `${folderPrefix.replace(/\/$/, "").replace(/^\//, "")}/`
    : "";

  const d1 = createPolishPdf();
  build1(d1, ctx);
  finishDoc(d1, zip, `${prefix}1_Wniosek_o_wpis_do_rejestru.pdf`);

  const d2 = createPolishPdf();
  build2(d2, ctx);
  finishDoc(d2, zip, `${prefix}2_Oswiadczenie_wlasciciela.pdf`);

  const d3 = createPolishPdf();
  build3(d3, ctx);
  finishDoc(d3, zip, `${prefix}3_Regulamin_lokalu.pdf`);

  const d4 = createPolishPdf();
  build4(d4, ctx);
  finishDoc(d4, zip, `${prefix}4_Wzor_umowy_najmu.pdf`);

  const d5 = createPolishPdf();
  build5(d5, ctx);
  finishDoc(d5, zip, `${prefix}5_Checklista_dokumentow.pdf`);

  const d6 = createPolishPdf();
  build6(d6, ctx);
  finishDoc(d6, zip, `${prefix}6_Instrukcja_krok_po_kroku.pdf`);
}
