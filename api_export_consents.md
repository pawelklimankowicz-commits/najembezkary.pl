# Endpoint `/api/export-consents` — Raport CSV zgód dla UODO

---

## 1. Endpoint — `src/app/api/export-consents/route.ts`

```typescript
// src/app/api/export-consents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Klucz API do zabezpieczenia endpointu przed nieautoryzowanym dostępem
// Ustaw w .env.local: EXPORT_API_SECRET=twoj-tajny-klucz-min-32-znaki
const EXPORT_SECRET = process.env.EXPORT_API_SECRET;

// Pomocnik: escapowanie wartości CSV (RFC 4180)
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Jeśli zawiera przecinek, cudzysłów lub nową linię — otocz cudzysłowami
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generuj wiersz CSV
function toCsvRow(fields: unknown[]): string {
  return fields.map(escapeCsv).join(',');
}

export async function GET(req: NextRequest) {
  // 1. Autoryzacja — sprawdź tajny klucz API w nagłówku
  const headersList = headers();
  const authHeader = headersList.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '').trim();

  if (!EXPORT_SECRET || apiKey !== EXPORT_SECRET) {
    return NextResponse.json(
      { error: 'Brak autoryzacji. Wymagany nagłówek: Authorization: Bearer <EXPORT_API_SECRET>' },
      { status: 401 }
    );
  }

  // 2. Pobierz parametry zapytania
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');       // filtr po emailu
  const orderId = searchParams.get('order_id');  // filtr po zamówieniu
  const dateFrom = searchParams.get('date_from'); // np. 2026-01-01
  const dateTo = searchParams.get('date_to');    // np. 2026-12-31
  const format = searchParams.get('format') ?? 'csv'; // csv | json

  // 3. Zbuduj zapytanie do Supabase
  let query = supabase
    .from('consents_log')
    .select(`
      id,
      order_id,
      session_id,
      email,
      terms_accepted,
      digital_content_consent,
      analytics_consent,
      marketing_consent,
      terms_version,
      privacy_policy_version,
      ip_address,
      user_agent,
      referrer,
      consented_at,
      created_at
    `)
    .order('consented_at', { ascending: false });

  // Zastosuj filtry
  if (email) query = query.eq('email', email);
  if (orderId) query = query.eq('order_id', orderId);
  if (dateFrom) query = query.gte('consented_at', `${dateFrom}T00:00:00.000Z`);
  if (dateTo) query = query.lte('consented_at', `${dateTo}T23:59:59.999Z`);

  const { data: consents, error } = await query;

  if (error) {
    console.error('[export-consents] Błąd Supabase:', error.message);
    return NextResponse.json(
      { error: 'Błąd pobierania danych z bazy.' },
      { status: 500 }
    );
  }

  if (!consents || consents.length === 0) {
    return NextResponse.json(
      { message: 'Brak danych spełniających podane kryteria.', count: 0 },
      { status: 404 }
    );
  }

  // 4. Format JSON
  if (format === 'json') {
    return NextResponse.json(
      {
        meta: {
          generated_at: new Date().toISOString(),
          total_records: consents.length,
          filters: { email, order_id: orderId, date_from: dateFrom, date_to: dateTo },
          purpose: 'Raport zgód RODO — najembezkary.pl',
          legal_basis: 'Art. 15 RODO — prawo dostępu osoby, której dane dotyczą',
        },
        data: consents,
      },
      { status: 200 }
    );
  }

  // 5. Format CSV (domyślny)
  const BOM = '\uFEFF'; // BOM UTF-8 — konieczny dla poprawnego wyświetlania polskich znaków w Excelu

  const csvHeader = toCsvRow([
    'ID zgody',
    'ID zamówienia',
    'ID sesji',
    'Adres e-mail',
    'Regulamin zaakceptowany',
    'Zgoda na treści cyfrowe (art. 38 pkt 13 u.p.k.)',
    'Zgoda na cookies analityczne',
    'Zgoda marketingowa',
    'Wersja Regulaminu',
    'Wersja Polityki prywatności',
    'Adres IP',
    'Przeglądarka (User-Agent)',
    'Strona odsyłająca (Referrer)',
    'Data i czas zgody (UTC)',
    'Data i czas zapisu (UTC)',
  ]);

  const csvRows = consents.map((c) =>
    toCsvRow([
      c.id,
      c.order_id ?? '',
      c.session_id ?? '',
      c.email ?? '',
      c.terms_accepted ? 'TAK' : 'NIE',
      c.digital_content_consent ? 'TAK' : 'NIE',
      c.analytics_consent ? 'TAK' : 'NIE',
      c.marketing_consent ? 'TAK' : 'NIE',
      c.terms_version ?? '',
      c.privacy_policy_version ?? '',
      c.ip_address ?? '',
      c.user_agent ?? '',
      c.referrer ?? '',
      c.consented_at ?? '',
      c.created_at ?? '',
    ])
  );

  // Sekcja nagłówkowa w pliku CSV (metadane dla UODO)
  const metaLines = [
    toCsvRow(['RAPORT ZGÓD RODO — najembezkary.pl']),
    toCsvRow(['Wygenerowano:', new Date().toISOString()]),
    toCsvRow(['Łączna liczba rekordów:', String(consents.length)]),
    toCsvRow(['Filtr email:', email ?? '(brak)']),
    toCsvRow(['Filtr ID zamówienia:', orderId ?? '(brak)']),
    toCsvRow(['Filtr data od:', dateFrom ?? '(brak)']),
    toCsvRow(['Filtr data do:', dateTo ?? '(brak)']),
    toCsvRow(['Podstawa prawna raportu:', 'Art. 15 RODO — prawo dostępu do danych']),
    toCsvRow(['']), // pusta linia
  ];

  const csvContent = BOM + [...metaLines, csvHeader, ...csvRows].join('\r\n');

  // Nazwa pliku z datą
  const fileName = `zgody_rodo_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store, no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
```

---

## 2. Zmienna środowiskowa — `.env.local`

```bash
# Tajny klucz do zabezpieczenia endpointu eksportu
# Minimum 32 znaki — wygeneruj: openssl rand -hex 32
EXPORT_API_SECRET=wklej-tutaj-wygenerowany-klucz-min-32-znaki
```

---

## 3. Przykłady użycia

### Wszystkie zgody dla konkretnego emaila (żądanie UODO)
```bash
curl -H "Authorization: Bearer TWOJ_EXPORT_API_SECRET" \
  "https://najembezkary.pl/api/export-consents?email=klient@example.com" \
  -o zgody_klient.csv
```

### Wszystkie zgody w danym przedziale dat
```bash
curl -H "Authorization: Bearer TWOJ_EXPORT_API_SECRET" \
  "https://najembezkary.pl/api/export-consents?date_from=2026-04-01&date_to=2026-04-30" \
  -o zgody_kwiecien_2026.csv
```

### Zgody dla konkretnego zamówienia
```bash
curl -H "Authorization: Bearer TWOJ_EXPORT_API_SECRET" \
  "https://najembezkary.pl/api/export-consents?order_id=uuid-zamowienia" \
  -o zgody_zamowienie.csv
```

### Pełny raport wszystkich zgód w formacie JSON
```bash
curl -H "Authorization: Bearer TWOJ_EXPORT_API_SECRET" \
  "https://najembezkary.pl/api/export-consents?format=json" \
  -o zgody_wszystkie.json
```

---

## 4. Przykład wygenerowanego pliku CSV

```
RAPORT ZGÓD RODO — najembezkary.pl
Wygenerowano:,2026-04-04T08:05:00.000Z
Łączna liczba rekordów:,1
Filtr email:,klient@example.com
Filtr ID zamówienia:,(brak)
Filtr data od:,(brak)
Filtr data do:,(brak)
Podstawa prawna raportu:,Art. 15 RODO — prawo dostępu do danych

ID zgody,ID zamówienia,ID sesji,Adres e-mail,Regulamin zaakceptowany,...,Data i czas zgody (UTC)
a1b2c3d4-...,f5e6d7c8-...,sess-xyz,klient@example.com,TAK,TAK,NIE,NIE,2026-04-04,2026-04-04,185.23.45.67,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",https://najembezkary.pl/platnosc,2026-04-04T08:05:00.000Z,2026-04-04T08:05:00.001Z
```

---

## 5. Procedura odpowiedzi na żądanie UODO

Gdy UODO lub klient zażąda raportu (art. 15 RODO — prawo dostępu):

1. **Zidentyfikuj email** klienta z żądania
2. Wywołaj endpoint:
   ```
   GET /api/export-consents?email=klient@example.com
   ```
3. Pobierz CSV — zawiera wszystkie zgody, IP, UA, timestamp, wersję dokumentów
4. Dołącz do odpowiedzi wraz z informacją o przetwarzaniu danych
5. **Termin:** 1 miesiąc od otrzymania żądania (art. 12 ust. 3 RODO), możliwe przedłużenie do 3 miesięcy

---

## 6. Dodaj do middleware.ts — chroń endpoint przed botami

```typescript
// middleware.ts — upewnij się że /api/export-consents jest chroniony
export const config = {
  matcher: [
    '/dashboard(.*)',
    '/generator(.*)',
    '/invoices(.*)',
    '/profile(.*)',
    '/ksef(.*)',
    '/billing(.*)',
    // NIE dodawaj /api/export-consents — chroniony własnym kluczem API
  ],
};
```
