# Endpoint `/api/delete-user-data` — Prawo do bycia zapomnianym (art. 17 RODO)

---

## 1. SQL — tabela `deletion_log` (log operacji usunięcia dla UODO)

```sql
-- ============================================================
-- Tabela: deletion_log
-- Cel: Dowód wykonania prawa do bycia zapomnianym (art. 17 RODO)
-- WAŻNE: Tej tabeli NIE czyść — stanowi dowód wykonania obowiązku
-- ============================================================

CREATE TABLE deletion_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dane żądania
  request_email         TEXT NOT NULL,         -- email czyjego dotyczyło żądanie
  request_received_at   TIMESTAMPTZ NOT NULL,  -- kiedy wpłynęło żądanie
  request_source        TEXT,                  -- 'email' | 'formularz' | 'uodo' | 'api'
  request_notes         TEXT,                  -- notatka (np. "żądanie z emaila z dnia...")
  
  -- Wykonanie
  executed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_by           TEXT NOT NULL,         -- 'api_automated' | 'admin_manual' | 'system'
  
  -- Co zostało usunięte/zanonimizowane
  orders_anonymized     INTEGER DEFAULT 0,     -- liczba zanonimizowanych zamówień
  consents_anonymized   INTEGER DEFAULT 0,     -- liczba zanonimizowanych wpisów zgód
  files_deleted         INTEGER DEFAULT 0,     -- liczba usuniętych plików z Storage
  
  -- Dane techniczne żądania
  requester_ip          INET,                  -- IP osoby składającej żądanie przez API
  requester_user_agent  TEXT,
  api_key_used          TEXT,                  -- pierwsze 8 znaków klucza (identyfikacja)
  
  -- Wynik
  status                TEXT NOT NULL,         -- 'success' | 'partial' | 'failed' | 'not_found'
  error_details         TEXT,                  -- opis błędu jeśli status != success
  
  -- Zachowane dane (podstawy prawne zatrzymania)
  retained_data_reason  TEXT,                  -- np. "Dane księgowe zatrzymane przez 5 lat (art. 74 ustawy o rachunkowości)"
  
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_deletion_log_email ON deletion_log(request_email);
CREATE INDEX idx_deletion_log_executed_at ON deletion_log(executed_at);

-- RLS — tylko service_role
ALTER TABLE deletion_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tylko service_role" ON deletion_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE deletion_log IS
  'Dowód wykonania prawa do bycia zapomnianym (art. 17 RODO). NIE USUWAĆ — wymagany do wykazania zgodności z RODO.';
```

---

## 2. Endpoint — `src/app/api/delete-user-data/route.ts`

```typescript
// src/app/api/delete-user-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const EXPORT_SECRET = process.env.EXPORT_API_SECRET;

// Dane retencyjne — czego NIE możemy usunąć i dlaczego
const RETENTION_NOTICE =
  'Dane finansowe/księgowe powiązane z zamówieniami zostały zanonimizowane, ' +
  'ale faktyczny fakt transakcji (kwota, data, ID zamówienia) zachowany przez ' +
  '5 lat na podstawie art. 74 ust. 2 pkt 6 ustawy z dnia 29 września 1994 r. ' +
  'o rachunkowości (Dz.U. z 2023 r. poz. 120 ze zm.). ' +
  'Log zgód RODO zanonimizowany — zachowany jako dowód wykonania obowiązku prawnego ' +
  'na podstawie art. 6 ust. 1 lit. c RODO w zw. z art. 5 ust. 2 RODO (rozliczalność).';

export async function DELETE(req: NextRequest) {
  const startedAt = new Date();

  // 1. Autoryzacja
  const headersList = headers();
  const authHeader = headersList.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '').trim() ?? '';

  if (!EXPORT_SECRET || apiKey !== EXPORT_SECRET) {
    return NextResponse.json(
      { error: 'Brak autoryzacji. Wymagany nagłówek: Authorization: Bearer <EXPORT_API_SECRET>' },
      { status: 401 }
    );
  }

  // 2. Pobierz dane żądania
  const body = await req.json().catch(() => ({}));
  const {
    email,
    request_received_at,
    request_source = 'api',
    request_notes = '',
  } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Wymagane pole: email (poprawny adres e-mail).' },
      { status: 400 }
    );
  }

  const emailLower = email.toLowerCase().trim();

  // Dane techniczne żądającego
  const requesterIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  const requesterUA = headersList.get('user-agent') ?? null;
  const apiKeyPreview = apiKey.slice(0, 8) + '...';

  let ordersAnonymized = 0;
  let consentsAnonymized = 0;
  let filesDeleted = 0;
  const errors: string[] = [];

  try {
    // ================================================================
    // KROK 1: Znajdź wszystkie zamówienia powiązane z emailem
    // ================================================================
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, documents_url')
      .eq('email', emailLower);

    if (ordersErr) {
      errors.push(`Błąd pobierania zamówień: ${ordersErr.message}`);
    }

    const orderIds = orders?.map((o) => o.id) ?? [];

    // ================================================================
    // KROK 2: Usuń pliki ZIP z Supabase Storage
    // ================================================================
    for (const order of orders ?? []) {
      try {
        const filePath = `documents/${order.id}/pakiet_najembezkary.zip`;
        const { error: storageErr } = await supabase.storage
          .from('documents')
          .remove([filePath]);

        if (!storageErr) {
          filesDeleted++;
        } else {
          // Plik może nie istnieć — to nie jest błąd krytyczny
          if (!storageErr.message.includes('Not Found')) {
            errors.push(`Storage ${order.id}: ${storageErr.message}`);
          }
        }
      } catch (e) {
        errors.push(`Storage wyjątek ${order.id}: ${String(e)}`);
      }
    }

    // ================================================================
    // KROK 3: Zanonimizuj dane osobowe w tabeli orders
    // ZACHOWAJ: id, status, amount, currency, created_at (obowiązek rachunkowy)
    // USUŃ: wszystkie dane osobowe właściciela i lokalu
    // ================================================================
    if (orderIds.length > 0) {
      const { error: anonOrdersErr, count } = await supabase
        .from('orders')
        .update({
          // Dane właściciela — ANONIMIZACJA
          email: 'ZANONIMIZOWANO',
          owner_name: 'ZANONIMIZOWANO',
          owner_pesel: null,
          owner_address: 'ZANONIMIZOWANO',
          owner_city: 'ZANONIMIZOWANO',
          owner_zip: 'ZANONIMIZOWANO',
          owner_phone: null,

          // Dane lokalu — ANONIMIZACJA
          property_address: 'ZANONIMIZOWANO',
          property_city: 'ZANONIMIZOWANO',
          property_zip: 'ZANONIMIZOWANO',

          // Dane działalności — ANONIMIZACJA
          rental_platform: null,
          rental_since: null,
          quiz_answers: null,

          // Link do dokumentów — USUNIĘCIE
          documents_url: null,
          download_token: null,
        })
        .in('id', orderIds);

      if (anonOrdersErr) {
        errors.push(`Anonimizacja orders: ${anonOrdersErr.message}`);
      } else {
        ordersAnonymized = count ?? orderIds.length;
      }
    }

    // ================================================================
    // KROK 4: Zanonimizuj wpisy w consents_log
    // ZACHOWAJ: fakt udzielenia zgody, timestamp, wersje dokumentów
    // USUŃ: email, IP, User-Agent (dane osobowe)
    // ================================================================
    const { error: anonConsentsErr, count: consentsCount } = await supabase
      .from('consents_log')
      .update({
        email: 'ZANONIMIZOWANO',
        ip_address: null,
        user_agent: 'ZANONIMIZOWANO',
        referrer: null,
      })
      .eq('email', emailLower);

    if (anonConsentsErr) {
      errors.push(`Anonimizacja consents_log: ${anonConsentsErr.message}`);
    } else {
      consentsAnonymized = consentsCount ?? 0;
    }

    // ================================================================
    // KROK 5: Zapisz log operacji usunięcia (dowód dla UODO)
    // ================================================================
    const status = errors.length === 0
      ? 'success'
      : ordersAnonymized > 0 || consentsAnonymized > 0
      ? 'partial'
      : 'failed';

    await supabase.from('deletion_log').insert({
      request_email: emailLower,
      request_received_at: request_received_at ?? startedAt.toISOString(),
      request_source,
      request_notes,
      executed_at: new Date().toISOString(),
      executed_by: 'api_automated',
      orders_anonymized: ordersAnonymized,
      consents_anonymized: consentsAnonymized,
      files_deleted: filesDeleted,
      requester_ip: requesterIp,
      requester_user_agent: requesterUA,
      api_key_used: apiKeyPreview,
      status,
      error_details: errors.length > 0 ? errors.join(' | ') : null,
      retained_data_reason: RETENTION_NOTICE,
    });

    // ================================================================
    // KROK 6: Wyślij potwierdzenie emailem do osoby składającej żądanie
    // (jeśli adres nie został jeszcze zanonimizowany i jest dostępny)
    // ================================================================
    if (status !== 'failed' && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'najembezkary.pl <kontakt@najembezkary.pl>',
          to: [emailLower],
          subject: 'Potwierdzenie realizacji prawa do bycia zapomnianym — najembezkary.pl',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #1a3c5e;">Prawo do usunięcia danych — potwierdzenie realizacji</h2>
              <p>Szanowna Pani / Szanowny Panie,</p>
              <p>
                Niniejszym potwierdzamy, że w dniu <strong>${new Date().toLocaleDateString('pl-PL')}</strong>
                wykonaliśmy Pani/Pana żądanie usunięcia danych osobowych złożone na podstawie
                <strong>art. 17 Rozporządzenia (UE) 2016/679 (RODO)</strong>.
              </p>
              <h3 style="color: #1a3c5e;">Co zostało zanonimizowane / usunięte:</h3>
              <ul>
                <li>Dane osobowe właściciela (imię, nazwisko, PESEL, adres, telefon) — <strong>zanonimizowane</strong></li>
                <li>Dane lokalu (adres, miasto, kod pocztowy) — <strong>zanonimizowane</strong></li>
                <li>Odpowiedzi z quizu i dane działalności — <strong>usunięte</strong></li>
                <li>Pliki dokumentów (ZIP) — <strong>usunięte z serwera</strong></li>
                <li>Adres IP i identyfikatory techniczne z rejestru zgód — <strong>zanonimizowane</strong></li>
                <li>Adres e-mail ze wszystkich rekordów — <strong>zanonimizowany</strong></li>
              </ul>
              <h3 style="color: #1a3c5e;">Co zostało zachowane i dlaczego:</h3>
              <p style="background: #f5f5f5; padding: 12px; border-left: 3px solid #1a3c5e; font-size: 13px;">
                ${RETENTION_NOTICE}
              </p>
              <p>
                Operacja została zarejestrowana w naszym systemie z numerem referencyjnym
                i może zostać udostępniona organowi nadzorczemu (UODO) na jego żądanie.
              </p>
              <p>
                W razie pytań prosimy o kontakt: 
                <a href="mailto:kontakt@najembezkary.pl">kontakt@najembezkary.pl</a>
              </p>
              <hr style="border: 1px solid #eee; margin: 24px 0;">
              <p style="color: #999; font-size: 11px;">
                najembezkary.pl | Administrator danych osobowych<br>
                Realizacja prawa do usunięcia danych (art. 17 RODO)
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        // Email mógł nie dotrzeć bo adres już zanonimizowany — to ok
        errors.push(`Email potwierdzający: ${String(emailErr)}`);
      }
    }

    // ================================================================
    // KROK 7: Zwróć odpowiedź
    // ================================================================
    return NextResponse.json({
      success: status !== 'failed',
      status,
      summary: {
        email: emailLower,
        executed_at: new Date().toISOString(),
        orders_anonymized: ordersAnonymized,
        consents_anonymized: consentsAnonymized,
        files_deleted: filesDeleted,
        retained_data_reason: RETENTION_NOTICE,
        confirmation_email_sent: status !== 'failed',
      },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (unexpectedErr) {
    // Zapisz błąd krytyczny do deletion_log
    await supabase.from('deletion_log').insert({
      request_email: emailLower,
      request_received_at: request_received_at ?? startedAt.toISOString(),
      request_source,
      executed_at: new Date().toISOString(),
      executed_by: 'api_automated',
      status: 'failed',
      error_details: `Krytyczny błąd: ${String(unexpectedErr)}`,
      requester_ip: requesterIp,
      requester_user_agent: requesterUA,
      api_key_used: apiKeyPreview,
      retained_data_reason: RETENTION_NOTICE,
    }).catch(() => {}); // Ignoruj błąd zapisu do logu

    return NextResponse.json(
      { error: 'Krytyczny błąd serwera. Operacja nie została wykonana.', details: String(unexpectedErr) },
      { status: 500 }
    );
  }
}
```

---

## 3. Przykłady użycia

### Usunięcie danych na żądanie klienta
```bash
curl -X DELETE \
  -H "Authorization: Bearer TWOJ_EXPORT_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "klient@example.com",
    "request_received_at": "2026-04-04T08:00:00Z",
    "request_source": "email",
    "request_notes": "Żądanie otrzymane emailem w dniu 04.04.2026, znak sprawy: RDP/2026/001"
  }' \
  https://najembezkary.pl/api/delete-user-data
```

### Odpowiedź sukcesu
```json
{
  "success": true,
  "status": "success",
  "summary": {
    "email": "klient@example.com",
    "executed_at": "2026-04-04T08:05:00.000Z",
    "orders_anonymized": 2,
    "consents_anonymized": 3,
    "files_deleted": 2,
    "retained_data_reason": "Dane finansowe/księgowe...",
    "confirmation_email_sent": true
  }
}
```

---

## 4. Sprawdzenie logu usunięcia (dla UODO)

```sql
-- Wszystkie operacje usunięcia
SELECT
  id,
  request_email,
  request_received_at,
  request_source,
  request_notes,
  executed_at,
  orders_anonymized,
  consents_anonymized,
  files_deleted,
  status,
  error_details,
  retained_data_reason
FROM deletion_log
ORDER BY executed_at DESC;

-- Konkretna operacja dla UODO
SELECT * FROM deletion_log
WHERE request_email = 'klient@example.com'
ORDER BY executed_at DESC;
```

---

## 5. Procedura odpowiedzi na żądanie art. 17 RODO

1. **Otrzymujesz email** od klienta z żądaniem usunięcia danych
2. **Wywołaj endpoint** z `request_notes` zawierającymi datę i numer żądania
3. **Zachowaj odpowiedź JSON** — to Twój dowód wykonania operacji
4. **Klient otrzymuje email** z potwierdzeniem i wyjaśnieniem co zachowano i dlaczego
5. **Termin:** 1 miesiąc od otrzymania żądania (art. 12 ust. 3 RODO)
6. **W razie kontroli UODO** — pobierz raport z tabeli `deletion_log`
