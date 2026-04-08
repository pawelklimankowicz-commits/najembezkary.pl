# Dodatek do promptu Cursor — Baza wszystkich gmin z danymi urzędów

## Wklej ten prompt jako kontynuację po zbudowaniu MVP najembezkary.pl

---

```
Dodaj do najembezkary.pl kompletną bazę wszystkich 2479 gmin w Polsce z danymi urzędów.

## Cel
Po wypełnieniu quizu (pytanie 2 — miasto) i formularza, klient zobaczy:
- Dokładną nazwę urzędu gminy do którego składa dokumenty
- Adres urzędu
- Link do strony BIP urzędu
- Informację o sposobie składania wniosku (osobiście / ePUAP / poczta)

## Źródło danych — TERYT API (GUS)

Pobierz listę wszystkich gmin z rejestru TERYT:
https://eteryt.stat.gov.pl/eTeryt/rejestr_teryt/udostepnianie_danych/baza_teryt/uzytkownicy_indywidualni/pobieranie/pobieranie.aspx

Plik CSV "TERC" zawiera:
- WOJ (kod województwa)
- POW (kod powiatu)
- GMI (kod gminy)
- RODZ (1=miejska, 2=wiejska, 3=miejsko-wiejska)
- NAZWA
- NAZDOD (typ: gmina miejska / gmina wiejska / miasto na prawach powiatu itp.)

## Baza danych — nowa tabela Supabase

```sql
CREATE TABLE municipalities (
  id SERIAL PRIMARY KEY,
  teryt_code TEXT UNIQUE NOT NULL,       -- np. "0201011" (WOJ+POW+GMI+RODZ)
  name TEXT NOT NULL,                     -- np. "Bolesławiec"
  full_name TEXT NOT NULL,                -- np. "Gmina miejska Bolesławiec"
  type TEXT NOT NULL,                     -- 'miejska' | 'wiejska' | 'miejsko-wiejska' | 'miasto_na_prawach_powiatu'
  county TEXT NOT NULL,                   -- powiat: "bolesławiecki"
  voivodeship TEXT NOT NULL,              -- województwo: "dolnośląskie"
  
  -- Dane urzędu (generowane automatycznie)
  office_name TEXT NOT NULL,              -- "Urząd Miejski w Bolesławcu" / "Urząd Gminy Bolesławiec"
  office_address TEXT,                    -- "ul. Rynek 41, 59-700 Bolesławiec"
  office_phone TEXT,
  office_email TEXT,
  office_bip_url TEXT,                    -- https://bip.boleslawiec.pl
  
  -- Sposób składania
  accepts_epuap BOOLEAN DEFAULT true,
  accepts_mail BOOLEAN DEFAULT true,
  accepts_in_person BOOLEAN DEFAULT true,
  
  -- Dodatkowe info
  registration_info TEXT,                 -- informacja o rejestrze najmu (jeśli gmina ogłosiła)
  notes TEXT
);
```

## Jak wygenerować dane urzędów

Dla KAŻDEJ gminy z TERYT zastosuj następujące reguły:

### Nazwa urzędu:
- Gmina miejska / miasto na prawach powiatu → "Urząd Miejski w [nazwa]" (lub "Urząd Miasta [nazwa]" dla dużych miast)
- Gmina wiejska → "Urząd Gminy [nazwa]"
- Gmina miejsko-wiejska → "Urząd Miejski w [nazwa]" (dla miasta) lub "Urząd Gminy [nazwa]"

### Link BIP:
Generuj automatycznie jako: https://bip.[nazwa-bez-polskich-znakow].pl
Lub: https://[nazwa].bip.gov.pl
(BIP jest obowiązkowy dla każdego urzędu w Polsce)

### ePUAP:
Każdy urząd gminy w Polsce ma konto ePUAP — domyślnie true.

## Implementacja w aplikacji

### 1. Endpoint API
```
GET /api/municipalities/search?q=Kraków
```
Zwraca listę pasujących gmin (fuzzy search po nazwie).

### 2. Komponent autocomplete w quizie (pytanie 2)
Zamień zwykłe pole tekstowe na autocomplete z wyszukiwarką:
- Użytkownik wpisuje "Krak" → podpowiedzi: "Kraków (miasto na prawach powiatu, małopolskie)"
- Po wybraniu → zapisz teryt_code do sessionStorage

### 3. Sekcja "Gdzie złożyć dokumenty" na stronie sukcesu
Po pobraniu dokumentów pokaż:

```
📍 Twoje dokumenty złóż w:

[Urząd Miejski w Krakowie]
ul. Pl. Wszystkich Świętych 3-4
31-004 Kraków

Sposoby złożenia:
✓ Osobiście — w biurze podawczym urzędu
✓ Przez ePUAP — profil: /UMKrakow/SkrytkaESP
✓ Pocztą — listem poleconym na adres urzędu

Strona BIP: https://bip.krakow.pl
Telefon: (12) 616 16 16

⏰ Termin: do 20 maja 2026
```

### 4. W generowanych PDF-ach
W dokumencie "Instrukcja krok po kroku" (dokument nr 6) wstaw automatycznie dane urzędu klienta:
- Adres urzędu
- Link do BIP

## Seeding bazy danych

Utwórz skrypt seedowy który:
1. Pobiera CSV z TERYT (plik TERC)
2. Parsuje wszystkie gminy (2479)
3. Dla każdej generuje:
   - office_name na podstawie typu gminy
   - office_bip_url jako https://bip.[slug].pl
4. Wstawia do tabeli municipalities w Supabase

```typescript
// scripts/seed-municipalities.ts
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getOfficeName(name: string, type: string): string {
  const bigCities = ['Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 
    'Szczecin', 'Bydgoszcz', 'Lublin', 'Białystok', 'Katowice', 'Gdynia',
    'Częstochowa', 'Radom', 'Sosnowiec', 'Toruń', 'Kielce', 'Rzeszów', 'Gliwice',
    'Zabrze', 'Olsztyn', 'Bielsko-Biała', 'Bytom', 'Zielona Góra', 'Rybnik',
    'Ruda Śląska', 'Opole', 'Tychy', 'Gorzów Wielkopolski', 'Elbląg', 'Płock',
    'Dąbrowa Górnicza', 'Wałbrzych', 'Włocławek', 'Tarnów', 'Chorzów', 'Koszalin',
    'Kalisz', 'Legnica', 'Grudziądz', 'Jaworzno', 'Słupsk', 'Jastrzębie-Zdrój',
    'Nowy Sącz', 'Jelenia Góra', 'Siedlce', 'Mysłowice', 'Konin', 'Piła',
    'Piotrków Trybunalski', 'Inowrocław', 'Lubin', 'Ostrów Wielkopolski',
    'Suwałki', 'Stargard', 'Gniezno', 'Ostrowiec Świętokrzyski', 'Siemianowice Śląskie',
    'Głogów', 'Pabianice', 'Leszno', 'Żory', 'Zamość', 'Pruszków', 'Łomża'];

  if (type === 'miasto_na_prawach_powiatu' || bigCities.includes(name)) {
    return `Urząd Miasta ${name}`;
  }
  if (type === 'miejska' || type === 'miejsko-wiejska') {
    return `Urząd Miejski w ${name}`;
  }
  return `Urząd Gminy ${name}`;
}

async function seed() {
  // Pobierz TERC z: https://eteryt.stat.gov.pl
  const csv = fs.readFileSync('data/TERC.csv', 'utf-8');
  const records = parse(csv, { columns: true, delimiter: ';', skip_empty_lines: true });

  const municipalities = records
    .filter((r: any) => ['1', '2', '3'].includes(r.RODZ)) // tylko gminy (nie miasta w gm. miejsko-wiejskiej)
    .map((r: any) => {
      const typeMap: Record<string, string> = {
        '1': 'miejska', '2': 'wiejska', '3': 'miejsko-wiejska'
      };
      const type = r.NAZDOD?.includes('na prawach powiatu') ? 'miasto_na_prawach_powiatu' : typeMap[r.RODZ];
      const slug = slugify(r.NAZWA);
      
      return {
        teryt_code: `${r.WOJ}${r.POW}${r.GMI}${r.RODZ}`,
        name: r.NAZWA,
        full_name: `${r.NAZDOD} ${r.NAZWA}`,
        type,
        county: '', // uzupełnij z hierarchii TERYT
        voivodeship: '', // uzupełnij z hierarchii TERYT
        office_name: getOfficeName(r.NAZWA, type),
        office_bip_url: `https://bip.${slug}.pl`,
        accepts_epuap: true,
        accepts_mail: true,
        accepts_in_person: true,
      };
    });

  // Wstaw batchami po 100
  for (let i = 0; i < municipalities.length; i += 100) {
    const batch = municipalities.slice(i, i + 100);
    const { error } = await supabase.from('municipalities').upsert(batch, { onConflict: 'teryt_code' });
    if (error) console.error(`Batch ${i}: ${error.message}`);
    else console.log(`Batch ${i}-${i + batch.length} OK`);
  }
  
  console.log(`Seeded ${municipalities.length} municipalities`);
}

seed();
```

## Wzbogacanie danych (po seedzie)

Po załadowaniu bazowej listy, wzbogać dane o adresy i telefony:
1. Scraping BIP stron (każdy urząd ma BIP z danymi kontaktowymi)
2. Lub: kup bazę COIG (350 zł + VAT) z gotowymi danymi 2827 urzędów

Na start wystarczy sama nazwa urzędu + link BIP. Adres i telefon możesz dodawać stopniowo.

## Prompt do wyszukiwarki gmin (autocomplete)

Użyj biblioteki Fuse.js do fuzzy search po nazwie gminy:

```bash
npm install fuse.js
```

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(municipalities, {
  keys: ['name', 'full_name', 'voivodeship'],
  threshold: 0.3,
  includeScore: true,
});

// Szukaj
const results = fuse.search('Krakow'); // znajdzie "Kraków"
```

To daje typo-tolerant search — klient wpisuje "krakuf" i znajdzie "Kraków".

Zacznij od kroku 1: utwórz tabelę municipalities i skrypt seedowy.
```
