# Supabase — tabela `consents_log` + integracja z Next.js

---

## 1. SQL — utwórz tabelę w Supabase

Wejdź na **dashboard.supabase.com → Twój projekt → SQL Editor → New Query** i wykonaj:

```sql
-- ============================================================
-- Tabela: consents_log
-- Cel: Dowód udzielenia zgód RODO — obrona przed UODO/sądem
-- ============================================================

CREATE TABLE consents_log (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Powiązanie z zamówieniem (może być NULL przed zaksięgowaniem płatności)
  order_id                  UUID REFERENCES orders(id) ON DELETE SET NULL,
  session_id                TEXT,            -- unikalny ID sesji (przed płatnością)
  
  -- Dane zgód
  terms_accepted            BOOLEAN NOT NULL DEFAULT false,
  digital_content_consent   BOOLEAN NOT NULL DEFAULT false,  -- art. 38 pkt 13 u.p.k.
  analytics_consent         BOOLEAN NOT NULL DEFAULT false,
  marketing_consent         BOOLEAN NOT NULL DEFAULT false,
  
  -- Wersje dokumentów (hash lub data — co było zaakceptowane)
  terms_version             TEXT NOT NULL,   -- np. "2026-04-04" lub "v1.0"
  privacy_policy_version    TEXT NOT NULL,   -- np. "2026-04-04" lub "v1.0"
  
  -- Dane techniczne — dowód udzielenia zgody
  ip_address                INET,            -- adres IP użytkownika
  user_agent                TEXT,            -- przeglądarka/system
  referrer                  TEXT,            -- skąd przyszedł użytkownik
  
  -- Dane identyfikacyjne
  email                     TEXT,            -- email podany w formularzu
  
  -- Timestamp — KLUCZOWY dla UODO
  consented_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadane
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_consents_log_order_id    ON consents_log(order_id);
CREATE INDEX idx_consents_log_email       ON consents_log(email);
CREATE INDEX idx_consents_log_consented_at ON consents_log(consented_at);
CREATE INDEX idx_consents_log_ip          ON consents_log(ip_address);

-- Komentarz do tabeli (dokumentacja w Supabase)
COMMENT ON TABLE consents_log IS 
  'Dowód udzielenia zgód RODO. Dane przechowywane przez 3 lata od wygaśnięcia relacji (przedawnienie roszczeń). NIE USUWAĆ bez analizy prawnej.';

COMMENT ON COLUMN consents_log.terms_version IS 
  'Wersja Regulaminu zaakceptowanego przez użytkownika (data publikacji lub numer wersji)';

COMMENT ON COLUMN consents_log.digital_content_consent IS 
  'Zgoda wymagana przez art. 38 pkt 13 ustawy o prawach konsumenta — kluczowe dla wyłączenia prawa odstąpienia';

COMMENT ON COLUMN consents_log.ip_address IS 
  'Adres IP użytkownika w chwili udzielenia zgody — dowód w postępowaniu przed UODO';
```

---

## 2. Row Level Security (RLS) — zabezpiecz tabelę

```sql
-- Włącz RLS
ALTER TABLE consents_log ENABLE ROW LEVEL SECURITY;

-- Tylko serwis (service_role) może czytać i pisać — nie klient
-- Brak publicznych polityk = tabela niedostępna z frontendu
-- Dostęp tylko przez SUPABASE_SERVICE_ROLE_KEY (backend Next.js)

-- Opcjonalnie: polityka dla dashboardu Supabase (Studio)
CREATE POLICY "Tylko service_role" ON consents_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

## 3. API endpoint — `/api/log-consent/route.ts`

```typescript
// src/app/api/log-consent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // WAŻNE: service role, nie anon
);

// Wersje dokumentów — aktualizuj przy każdej zmianie Regulaminu/PP
const TERMS_VERSION = '2026-04-04';
const PRIVACY_POLICY_VERSION = '2026-04-04';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      termsAccepted,
      digitalContentConsent,
      analyticsConsent,
      marketingConsent,
      email,
      sessionId,
      orderId, // opcjonalne — może być dodane po zawarciu umowy
    } = body;

    // Pobierz IP i User-Agent z nagłówków żądania
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ipAddress = forwarded
      ? forwarded.split(',')[0].trim()
      : req.ip ?? null;
    const userAgent = headersList.get('user-agent') ?? null;
    const referrer = headersList.get('referer') ?? null;

    // Walidacja — checkboxy obowiązkowe muszą być true
    if (!termsAccepted || !digitalContentConsent) {
      return NextResponse.json(
        { error: 'Wymagane zgody nie zostały udzielone.' },
        { status: 400 }
      );
    }

    // Zapisz do bazy
    const { data, error } = await supabase
      .from('consents_log')
      .insert({
        order_id: orderId ?? null,
        session_id: sessionId ?? null,
        terms_accepted: termsAccepted,
        digital_content_consent: digitalContentConsent,
        analytics_consent: analyticsConsent ?? false,
        marketing_consent: marketingConsent ?? false,
        terms_version: TERMS_VERSION,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        email: email ?? null,
        consented_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[consents_log] Błąd zapisu:', error.message);
      return NextResponse.json(
        { error: 'Błąd zapisu zgody.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, consentId: data.id });
  } catch (err) {
    console.error('[consents_log] Nieoczekiwany błąd:', err);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}
```

---

## 4. Wywołanie w formularzu zamówienia

```typescript
// W komponencie formularza — wywołaj log-consent PRZED przekierowaniem do Stripe

async function handleSubmit() {
  // 1. Walidacja danych formularza
  if (!validateForm()) return;

  // 2. Walidacja zgód
  if (!consents.termsAccepted || !consents.digitalContentConsent) {
    toast({ 
      title: 'Wymagane zgody', 
      description: 'Zaznacz obowiązkowe pola przed kontynuacją.',
      variant: 'destructive'
    });
    return;
  }

  // 3. Zapisz zgody — PRZED płatnością
  const consentResponse = await fetch('/api/log-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      termsAccepted: consents.termsAccepted,
      digitalContentConsent: consents.digitalContentConsent,
      analyticsConsent: consents.analyticsConsent,
      marketingConsent: consents.marketingConsent,
      email: formData.email,
      sessionId: crypto.randomUUID(), // unikalne ID sesji
    }),
  });

  if (!consentResponse.ok) {
    toast({ 
      title: 'Błąd', 
      description: 'Nie można zapisać zgód. Spróbuj ponownie.',
      variant: 'destructive'
    });
    return;
  }

  const { consentId } = await consentResponse.json();

  // 4. Przejdź do Stripe Checkout (przekaż consentId do backendu)
  const checkoutResponse = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      consentId, // powiąż zamówienie ze zgodami
    }),
  });

  const { url } = await checkoutResponse.json();
  window.location.href = url; // redirect do Stripe
}
```

---

## 5. Powiązanie zgód z zamówieniem (w webhooku Stripe)

```typescript
// W /api/webhook/route.ts — po zaksięgowaniu płatności:

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const orderId = session.metadata?.order_id;
  const consentId = session.metadata?.consent_id; // przekaż w metadata

  if (consentId && orderId) {
    // Zaktualizuj consent_log o order_id
    await supabase
      .from('consents_log')
      .update({ order_id: orderId })
      .eq('id', consentId);
  }
}
```

---

## 6. Jak sprawdzić zgody danego użytkownika (UODO, sąd)

W Supabase Studio → SQL Editor:

```sql
-- Wszystkie zgody dla danego emaila
SELECT
  id,
  email,
  terms_accepted,
  digital_content_consent,
  analytics_consent,
  marketing_consent,
  terms_version,
  privacy_policy_version,
  ip_address,
  user_agent,
  consented_at,
  order_id
FROM consents_log
WHERE email = 'klient@example.com'
ORDER BY consented_at DESC;

-- Zgody dla konkretnego zamówienia
SELECT * FROM consents_log WHERE order_id = 'uuid-zamówienia';

-- Raport: ile osób wyraziło zgodę marketingową
SELECT 
  COUNT(*) FILTER (WHERE marketing_consent = true) AS marketing_tak,
  COUNT(*) FILTER (WHERE marketing_consent = false) AS marketing_nie,
  COUNT(*) AS razem
FROM consents_log;
```

---

## 7. Okres przechowywania

Dodaj do Supabase zadanie archiwizacji (lub pamiętaj ręcznie):

```sql
-- Dane o zgodach przechowuj minimum 3 lata od ostatniego zamówienia
-- (przedawnienie roszczeń cywilnych — art. 118 k.c.)
-- NIE USUWAJ wcześniej bez analizy prawnej.

-- Opcjonalnie: po 3 latach anonimizuj dane osobowe (email, IP)
-- zachowując sam fakt udzielenia zgody:
UPDATE consents_log
SET 
  email = 'ZANONIMIZOWANO',
  ip_address = NULL,
  user_agent = 'ZANONIMIZOWANO'
WHERE consented_at < NOW() - INTERVAL '3 years';
```
