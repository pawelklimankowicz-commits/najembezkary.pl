# Prompt do Cursor Pro — najembezkary.pl

## Wklej poniższy prompt do Cursor Pro (Cmd+K lub Composer)

---

```
Zbuduj kompletną aplikację webową najembezkary.pl — generator pakietów dokumentów do rejestracji najmu krótkoterminowego w Polsce.

## Kontekst biznesowy
Od 20 maja 2026 obowiązuje rejestracja najmu krótkoterminowego w Polsce.
Kary za brak rejestracji: do 50 000 zł.
Produkt: jednorazowy zakup pakietu dokumentów za 399 zł brutto.
Klient: właściciel mieszkania wynajmowanego przez Airbnb / Booking / Renters.

## Stack technologiczny
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (baza danych PostgreSQL + Auth opcjonalnie)
- Stripe (jednorazowa płatność Checkout)
- Resend (potwierdzenie emailem po zakupie)
- jsPDF lub react-pdf (generowanie PDF)
- Vercel (deploy)

## Zmienne środowiskowe (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=          # jednorazowy produkt 399 PLN
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://najembezkary.pl

## Kolorystyka i branding
- Kolor główny: #1a3c5e (ciemny granat — zaufanie, prawo)
- Akcent: #e8b84b (złoty — premium, uwaga)
- Tło: #f8f9fa (jasne szare)
- Font: Inter (Google Fonts)
- Styl: profesjonalny, prawniczy, budujący zaufanie

---

## STRUKTURA PROJEKTU

src/
  app/
    page.tsx                    ← landing page
    quiz/page.tsx               ← krok 1: quiz kwalifikacyjny
    dane/page.tsx               ← krok 2: formularz danych
    platnosc/page.tsx           ← krok 3: podsumowanie + Stripe Checkout
    sukces/page.tsx             ← po płatności: pobranie paczki
    anulowanie/page.tsx         ← jeśli użytkownik anulował płatność
    api/
      checkout/route.ts         ← tworzy Stripe Checkout Session
      webhook/route.ts          ← odbiera zdarzenia Stripe
      generate-docs/route.ts    ← generuje dokumenty PDF
  components/
    ProgressBar.tsx             ← pasek postępu (Krok 1/2/3)
    QuizQuestion.tsx
    DocumentCard.tsx
  lib/
    supabase.ts
    stripe.ts
    resend.ts
    pdf-generator.ts

---

## BAZA DANYCH SUPABASE

### Tabela: orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- pending | paid | documents_generated | failed
  email TEXT NOT NULL,
  amount INTEGER DEFAULT 39900, -- w groszach (399.00 PLN)
  currency TEXT DEFAULT 'pln',
  
  -- Dane właściciela (z formularza)
  owner_name TEXT,
  owner_pesel TEXT,
  owner_address TEXT,
  owner_city TEXT,
  owner_zip TEXT,
  owner_phone TEXT,
  
  -- Dane lokalu
  property_address TEXT,
  property_city TEXT,
  property_zip TEXT,
  property_type TEXT, -- 'mieszkanie' | 'dom' | 'apartament' | 'pokoj'
  property_area NUMERIC,
  property_floor INTEGER,
  
  -- Dane działalności
  rental_platform TEXT[], -- ['airbnb', 'booking', 'renters', 'inne']
  rental_since TEXT,
  has_registration_number BOOLEAN DEFAULT false,
  
  -- Wyniki quizu
  quiz_answers JSONB,
  requires_registration BOOLEAN,
  registration_type TEXT, -- 'pelna' | 'uproszczona' | 'brak'
  
  -- Dokumenty
  documents_url TEXT, -- link do ZIP z dokumentami
  documents_generated_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  download_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## STRONA 1 — LANDING PAGE (src/app/page.tsx)

Zbuduj profesjonalny landing page z sekcjami:

### Hero
- Nagłówek H1: "Od 20 maja 2026 najem krótkoterminowy wymaga rejestracji"
- Podtytuł: "Brak rejestracji = kara do 50 000 zł. Przygotuj dokumenty w 15 minut."
- Duży przycisk CTA: "Sprawdź obowiązek i pobierz dokumenty →" → link do /quiz
- Pod przyciskiem: badge "399 zł — jednorazowo • Dokumenty gotowe w 5 minut"
- Licznik: "Czas do wejścia przepisów: [countdown do 20 maja 2026]"

### Dla kogo
3 kafelki:
- Właściciele wynajmujący przez Airbnb
- Właściciele wynajmujący przez Booking.com
- Operatorzy kilku mieszkań

### Co zawiera pakiet (lista z ikonkami ✓)
- Wniosek o wpis do rejestru obiektów krótkotrwałego zakwaterowania
- Oświadczenie właściciela lokalu
- Regulamin lokalu dla gości
- Instrukcja krok po kroku co dalej
- Checklista dokumentów wymaganych przez urząd
- Wzór umowy najmu krótkoterminowego

### Jak to działa (3 kroki)
1. Odpowiedz na 5 pytań → sprawdzamy czy obowiązek Cię dotyczy
2. Wpisz dane właściciela i lokalu → generujemy dokumenty
3. Zapłać 399 zł → pobierz gotową paczkę ZIP

### Dlaczego 399 zł
- U prawnika: 300–800 zł za sam przegląd
- Tu: pełny pakiet dokumentów od razu
- Oszczędność: kilka dni czekania na prawnika

### FAQ
- Czy to dotyczy mojego mieszkania?
- Co to jest rejestr obiektów krótkotrwałego zakwaterowania?
- Czy dokumenty są zgodne z przepisami?
- Co jeśli gmina nie ma jeszcze rejestru?
- Czy mogę pobrać dokumenty wielokrotnie?

### Footer
- najembezkary.pl | Polityka prywatności | Regulamin
- "Serwis ma charakter informacyjny. Nie świadczymy usług prawnych."

---

## STRONA 2 — QUIZ (src/app/quiz/page.tsx)

### Pasek postępu na górze
"Krok 1 z 3 — Sprawdź obowiązek"

### 5 pytań (wyświetlaj jedno po drugim, animacja slide)

**Pytanie 1:**
"Czy wynajmujesz mieszkanie lub dom turystom (krótkoterminowo, tj. poniżej 30 dni)?"
- [ ] Tak, przez Airbnb / Booking / Renters
- [ ] Tak, bezpośrednio (bez platformy)
- [ ] Nie, wynajmuję długoterminowo (ponad 30 dni)
→ Jeśli "Nie" → pokaż komunikat: "Przepisy o rejestracji najmu krótkoterminowego Cię nie dotyczą."

**Pytanie 2:**
"W jakim mieście jest Twój lokal?"
- Pole tekstowe z autocomplete (wpisz miasto)
→ Zapisz miasto, kontynuuj

**Pytanie 3:**
"Ile osób jednocześnie może przebywać w Twoim lokalu?"
- [ ] Do 4 osób
- [ ] 5–10 osób
- [ ] Powyżej 10 osób

**Pytanie 4:**
"Czy jesteś właścicielem lokalu?"
- [ ] Tak, jestem właścicielem
- [ ] Nie, jestem podnajemcą / zarządcą
- [ ] Zarządzam lokalami innych właścicieli

**Pytanie 5:**
"Czy Twój lokal ma już numer rejestracyjny?"
- [ ] Nie, nie mam numeru
- [ ] Nie wiem co to jest
- [ ] Tak, mam już numer

### Wynik quizu
Po 5 pytaniach — ekran z wynikiem:

**Jeśli wymaga rejestracji:**
```
✓ Twój lokal WYMAGA rejestracji

Dobra wiadomość: możemy Ci w tym pomóc.
Za 399 zł otrzymasz gotową paczkę dokumentów
do złożenia w urzędzie gminy.

[Przejdź do formularza →]
```

**Jeśli nie wymaga:**
```
ℹ Prawdopodobnie nie musisz się rejestrować

Jednak przepisy są złożone i zależą od gminy.
Dla pewności warto mieć dokumenty pod ręką.

[Pobierz paczkę dokumentów mimo to → 399 zł]
[Wróć na stronę główną]
```

Zapisz odpowiedzi do sessionStorage i przekaż do formularza.

---

## STRONA 3 — FORMULARZ DANYCH (src/app/dane/page.tsx)

### Pasek postępu: "Krok 2 z 3 — Twoje dane"

### Sekcja 1: Dane właściciela
- Imię i nazwisko *
- PESEL (opcjonalny, potrzebny do wniosku) — z info: "Potrzebny tylko do wniosku rejestracyjnego"
- Adres zamieszkania *
- Miasto *
- Kod pocztowy * (format XX-XXX)
- Telefon kontaktowy *
- Adres email * (na ten email wyślemy dokumenty)

### Sekcja 2: Dane lokalu
- Adres lokalu * (jeśli inny niż zamieszkania)
- Miasto lokalu *
- Kod pocztowy lokalu *
- Typ lokalu: Mieszkanie / Dom / Apartament / Pokój
- Powierzchnia (m²)
- Piętro

### Sekcja 3: Najem
- Przez jakie platformy wynajmujesz? (checkbox): Airbnb / Booking.com / Renters / Otodom / Bezpośrednio / Inne
- Od kiedy wynajmujesz? (rok)
- Nazwa lokalu w ogłoszeniu (opcjonalnie)

### Walidacja
- Wszystkie pola * wymagane
- Kod pocztowy: regex XX-XXX
- Email: poprawny format
- Inline błędy pod każdym polem

### Przycisk
"Przejdź do podsumowania →"

Zapisz dane do sessionStorage.

---

## STRONA 4 — PŁATNOŚĆ (src/app/platnosc/page.tsx)

### Pasek postępu: "Krok 3 z 3 — Płatność"

### Podsumowanie zamówienia
Karta z:
- Lista dokumentów które otrzymasz (6 pozycji z ✓)
- Właściciel: [imię i nazwisko]
- Lokal: [adres]
- Email dostawy: [email]

### Cena
```
Pakiet dokumentów najembezkary.pl
                              399,00 zł
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAZEM                         399,00 zł
Cena brutto (zwolnienie z VAT art. 43)
```

### Przycisk
Duży zielony przycisk:
"Zapłać 399 zł i pobierz dokumenty →"

Po kliknięciu:
1. POST /api/checkout z danymi z sessionStorage
2. Backend tworzy order w Supabase (status: pending)
3. Backend tworzy Stripe Checkout Session
4. Redirect do Stripe Checkout

### Informacje bezpieczeństwa
- 🔒 Płatność zabezpieczona przez Stripe
- Akceptujemy: BLIK, karta, przelew
- Faktura na żądanie

---

## API — CHECKOUT (src/app/api/checkout/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { ownerData, quizAnswers, email } = body;

  // 1. Zapisz zamówienie do Supabase ze statusem pending
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      email,
      status: 'pending',
      owner_name: ownerData.fullName,
      owner_address: ownerData.address,
      owner_city: ownerData.city,
      owner_zip: ownerData.zip,
      owner_phone: ownerData.phone,
      property_address: ownerData.propertyAddress || ownerData.address,
      property_city: ownerData.propertyCity || ownerData.city,
      property_type: ownerData.propertyType,
      rental_platform: ownerData.platforms,
      quiz_answers: quizAnswers,
      requires_registration: quizAnswers.requiresRegistration,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Utwórz Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'blik', 'p24'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: email,
    metadata: {
      order_id: order.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sukces?token=${order.download_token}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/anulowanie`,
    locale: 'pl',
    payment_intent_data: {
      metadata: {
        order_id: order.id,
      },
    },
  });

  // 3. Zaktualizuj order o stripe_session_id
  await supabase
    .from('orders')
    .update({ stripe_session_id: session.id })
    .eq('id', order.id);

  return NextResponse.json({ url: session.url });
}
```

---

## API — WEBHOOK STRIPE (src/app/api/webhook/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const orderId = session.metadata?.order_id;

    if (!orderId) return NextResponse.json({ received: true });

    // 1. Pobierz dane zamówienia
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // 2. Zaktualizuj status na paid
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', orderId);

    // 3. Wygeneruj dokumenty
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    // 4. Wyślij email z potwierdzeniem i linkiem do pobrania
    await resend.emails.send({
      from: 'najembezkary.pl <dokumenty@najembezkary.pl>',
      to: [order.email],
      subject: 'Twoje dokumenty są gotowe — najembezkary.pl',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3c5e;">Twoje dokumenty są gotowe!</h2>
          <p>Dziękujemy za zakup pakietu dokumentów najembezkary.pl.</p>
          <p>Kliknij przycisk poniżej, aby pobrać swoją paczkę dokumentów:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/sukces?token=${order.download_token}"
             style="display:inline-block; background:#1a3c5e; color:white; padding:14px 28px;
                    border-radius:8px; text-decoration:none; font-weight:bold; margin: 20px 0;">
            Pobierz dokumenty →
          </a>
          <p style="color:#666; font-size:13px;">
            Link jest aktywny przez 30 dni. Możesz pobrać dokumenty wielokrotnie.<br>
            W razie pytań: kontakt@najembezkary.pl
          </p>
          <hr style="border:1px solid #eee; margin:20px 0;">
          <p style="color:#999; font-size:11px;">
            najembezkary.pl | Serwis ma charakter informacyjny. Nie świadczymy usług prawnych.
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
```

---

## API — GENEROWANIE DOKUMENTÓW (src/app/api/generate-docs/route.ts)

```typescript
// Generuje 6 dokumentów PDF na podstawie danych z bazy
// i zapisuje ZIP do Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const zip = new JSZip();
  const today = new Date().toLocaleDateString('pl-PL');

  // DOKUMENT 1: Wniosek o wpis do rejestru
  const doc1 = new jsPDF();
  doc1.setFontSize(14);
  doc1.text('WNIOSEK O WPIS DO REJESTRU', 105, 30, { align: 'center' });
  doc1.text('OBIEKTÓW KRÓTKOTRWAŁEGO ZAKWATEROWANIA', 105, 40, { align: 'center' });
  doc1.setFontSize(11);
  doc1.text(`Miejscowość: ${order.owner_city}, dnia ${today}`, 20, 60);
  doc1.text('WNIOSKODAWCA:', 20, 80);
  doc1.text(`Imię i nazwisko: ${order.owner_name}`, 20, 90);
  doc1.text(`Adres: ${order.owner_address}, ${order.owner_zip} ${order.owner_city}`, 20, 100);
  doc1.text('DANE LOKALU:', 20, 120);
  doc1.text(`Adres: ${order.property_address}, ${order.property_city}`, 20, 130);
  doc1.text(`Typ: ${order.property_type}`, 20, 140);
  doc1.text('Wnoszę o dokonanie wpisu powyższego obiektu do rejestru', 20, 160);
  doc1.text('obiektów krótkotrwałego zakwaterowania.', 20, 170);
  doc1.text('Oświadczam, że podane informacje są prawdziwe.', 20, 190);
  doc1.text(`${order.owner_city}, ${today}`, 20, 220);
  doc1.text('_________________________', 120, 240);
  doc1.text('podpis wnioskodawcy', 120, 250);
  zip.file('1_Wniosek_o_wpis_do_rejestru.pdf', doc1.output('arraybuffer'));

  // DOKUMENT 2: Oświadczenie właściciela
  const doc2 = new jsPDF();
  doc2.setFontSize(14);
  doc2.text('OŚWIADCZENIE WŁAŚCICIELA LOKALU', 105, 30, { align: 'center' });
  doc2.setFontSize(11);
  doc2.text(`Ja, ${order.owner_name}, zamieszkały/a ${order.owner_address},`, 20, 60);
  doc2.text(`${order.owner_zip} ${order.owner_city}, oświadczam, że:`, 20, 70);
  doc2.text(`1. Jestem właścicielem lokalu przy ul. ${order.property_address}, ${order.property_city}.`, 20, 90);
  doc2.text('2. Lokal spełnia wymagania sanitarne i przeciwpożarowe.', 20, 100);
  doc2.text('3. Wyrażam zgodę na kontrolę lokalu przez uprawnione organy.', 20, 110);
  doc2.text('4. Zobowiązuję się do przestrzegania przepisów o najmie krótkoterminowym.', 20, 120);
  doc2.text(`${order.owner_city}, ${today}`, 20, 160);
  doc2.text('_________________________', 120, 180);
  doc2.text('podpis', 120, 190);
  zip.file('2_Oswiadczenie_wlasciciela.pdf', doc2.output('arraybuffer'));

  // DOKUMENT 3: Regulamin lokalu
  const doc3 = new jsPDF();
  doc3.setFontSize(14);
  doc3.text('REGULAMIN LOKALU', 105, 30, { align: 'center' });
  doc3.setFontSize(11);
  doc3.text(`Adres: ${order.property_address}, ${order.property_city}`, 20, 50);
  doc3.text('§1. Zasady ogólne', 20, 70);
  doc3.text('1. Zameldowanie (check-in) od godz. 15:00, wymeldowanie do godz. 11:00.', 20, 80);
  doc3.text('2. Cisza nocna obowiązuje w godzinach 22:00–6:00.', 20, 90);
  doc3.text('3. Palenie tytoniu i e-papierosów jest zabronione wewnątrz lokalu.', 20, 100);
  doc3.text('4. Zwierzęta wymagają wcześniejszej zgody właściciela.', 20, 110);
  doc3.text('§2. Odpowiedzialność', 20, 130);
  doc3.text('1. Gość ponosi odpowiedzialność za szkody wyrządzone w lokalu.', 20, 140);
  doc3.text('2. Właściciel nie odpowiada za rzeczy pozostawione w lokalu.', 20, 150);
  doc3.text('§3. Zasady bezpieczeństwa', 20, 170);
  doc3.text('1. Klucze muszą być zwrócone przy wymeldowaniu.', 20, 180);
  doc3.text('2. W razie awarii prosimy o niezwłoczny kontakt.', 20, 190);
  zip.file('3_Regulamin_lokalu.pdf', doc3.output('arraybuffer'));

  // DOKUMENT 4: Wzór umowy najmu krótkoterminowego
  const doc4 = new jsPDF();
  doc4.setFontSize(14);
  doc4.text('UMOWA NAJMU KRÓTKOTERMINOWEGO', 105, 30, { align: 'center' });
  doc4.setFontSize(11);
  doc4.text(`zawarta dnia ____________ w ${order.owner_city}`, 20, 50);
  doc4.text('pomiędzy:', 20, 60);
  doc4.text(`Wynajmującym: ${order.owner_name}`, 20, 70);
  doc4.text(`zamieszkałym: ${order.owner_address}, ${order.owner_city}`, 20, 80);
  doc4.text('a Najemcą: ___________________________', 20, 100);
  doc4.text('zamieszkałym: ___________________________', 20, 110);
  doc4.text('§1. Przedmiot umowy', 20, 130);
  doc4.text(`Wynajmujący oddaje Najemcy do używania lokal przy ${order.property_address}.`, 20, 140);
  doc4.text('§2. Okres najmu', 20, 160);
  doc4.text('Najem trwa od: ____________ do: ____________', 20, 170);
  doc4.text('§3. Czynsz', 20, 190);
  doc4.text('Czynsz wynosi: ____________ zł za dobę/noc.', 20, 200);
  doc4.text('Kaucja: ____________ zł, płatna przy zameldowaniu.', 20, 210);
  zip.file('4_Wzor_umowy_najmu.pdf', doc4.output('arraybuffer'));

  // DOKUMENT 5: Checklista dokumentów do urzędu
  const doc5 = new jsPDF();
  doc5.setFontSize(14);
  doc5.text('CHECKLISTA DOKUMENTÓW DO URZĘDU', 105, 30, { align: 'center' });
  doc5.text('Rejestracja najmu krótkoterminowego', 105, 45, { align: 'center' });
  doc5.setFontSize(11);
  doc5.text('Dokumenty wymagane do złożenia w urzędzie gminy:', 20, 65);
  doc5.text('☐  Wniosek o wpis do rejestru (wzór w załączniku)', 20, 85);
  doc5.text('☐  Oświadczenie właściciela lokalu (wzór w załączniku)', 20, 100);
  doc5.text('☐  Kopia dokumentu potwierdzającego własność lokalu', 20, 115);
  doc5.text('    (wypis z księgi wieczystej lub akt notarialny)', 20, 125);
  doc5.text('☐  Dokument tożsamości (dowód osobisty lub paszport)', 20, 140);
  doc5.text('☐  Numer NIP właściciela (jeśli prowadzi działalność)', 20, 155);
  doc5.text('Gdzie złożyć dokumenty:', 20, 180);
  doc5.text(`Urząd Gminy / Urząd Miasta ${order.property_city}`, 20, 190);
  doc5.text('Wydział: ds. działalności gospodarczej lub turystyki', 20, 200);
  doc5.text('Termin: do 20 maja 2026', 20, 215);
  doc5.text(`Przygotowano przez: najembezkary.pl — ${today}`, 20, 240);
  zip.file('5_Checklista_dokumentow.pdf', doc5.output('arraybuffer'));

  // DOKUMENT 6: Instrukcja krok po kroku
  const doc6 = new jsPDF();
  doc6.setFontSize(14);
  doc6.text('INSTRUKCJA REJESTRACJI NAJMU', 105, 30, { align: 'center' });
  doc6.text('KRÓTKOTERMINOWEGO — KROK PO KROKU', 105, 42, { align: 'center' });
  doc6.setFontSize(11);
  doc6.text('KROK 1 — Sprawdź czy Twoja gmina uruchomiła rejestr', 20, 65);
  doc6.text('Wejdź na stronę urzędu gminy i wyszukaj informacje', 20, 75);
  doc6.text('o "rejestrze obiektów krótkotrwałego zakwaterowania".', 20, 85);
  doc6.text('KROK 2 — Uzupełnij wniosek', 20, 105);
  doc6.text('Wypełnij wniosek (załącznik nr 1) danymi lokalu.', 20, 115);
  doc6.text('KROK 3 — Skompletuj dokumenty', 20, 135);
  doc6.text('Zbierz wszystkie dokumenty z checklisty (załącznik nr 5).', 20, 145);
  doc6.text('KROK 4 — Złóż dokumenty', 20, 165);
  doc6.text('Dostarcz osobiście lub wyślij pocztą do urzędu gminy.', 20, 175);
  doc6.text('KROK 5 — Uzyskaj numer rejestracyjny', 20, 195);
  doc6.text('Urząd nada numer, który musisz podawać w ogłoszeniach.', 20, 205);
  doc6.text('KROK 6 — Aktualizuj ogłoszenia', 20, 225);
  doc6.text('Dodaj numer rejestracyjny do ogłoszeń na Airbnb, Booking itp.', 20, 235);
  zip.file('6_Instrukcja_krok_po_kroku.pdf', doc6.output('arraybuffer'));

  // Spakuj ZIP i wgraj do Supabase Storage
  const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  const fileName = `documents/${orderId}/pakiet_najembezkary.zip`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, zipBuffer, { contentType: 'application/zip', upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Utwórz publiczny URL (przez signed URL)
  const { data: signedUrl } = await supabase.storage
    .from('documents')
    .createSignedUrl(fileName, 60 * 60 * 24 * 30); // 30 dni

  // Zaktualizuj order
  await supabase
    .from('orders')
    .update({
      status: 'documents_generated',
      documents_url: signedUrl?.signedUrl,
      documents_generated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return NextResponse.json({ success: true });
}
```

---

## STRONA 5 — SUKCES (src/app/sukces/page.tsx)

```typescript
// Pobiera token z URL, weryfikuje w Supabase, pokazuje przycisk pobrania

export default async function SukcesPage({ searchParams }) {
  const token = searchParams.token;
  // Pobierz order po download_token
  // Jeśli status !== 'documents_generated' → pokaż "Dokumenty są w trakcie generowania"
  // Jeśli ok → pokaż przycisk pobierania
}
```

Strona powinna zawierać:
- Duże ✓ z animacją
- "Dziękujemy! Twoje dokumenty są gotowe."
- Przycisk "Pobierz pakiet dokumentów (ZIP) →"
- "Link wysłany również na adres email: [email]"
- Liczba pobrań: "Możesz pobrać [X] razy"

---

## STRONA 6 — ANULOWANIE (src/app/anulowanie/page.tsx)

Prosta strona:
- "Płatność została anulowana."
- "Twoje dane nie zostały zapisane."
- Przycisk "Wróć i spróbuj ponownie →" → /platnosc

---

## KONFIGURACJA STRIPE

W dashboardzie Stripe utwórz:
- Produkt: "Pakiet dokumentów najembezkary.pl"
- Cena: 399,00 PLN (jednorazowo, nie recurring)
- Metody płatności: Karta, BLIK, Przelewy24

Webhook endpoint:
- URL: https://najembezkary.pl/api/webhook
- Zdarzenia: checkout.session.completed

---

## KONFIGURACJA SUPABASE STORAGE

Utwórz bucket "documents":
- Prywatny (nie publiczny)
- Dostęp przez signed URLs

---

## DEPLOY VERCEL

1. Wgraj projekt na GitHub
2. Vercel → New Project → Import
3. Dodaj wszystkie zmienne środowiskowe
4. Deploy → gotowe

---

## KOLEJNOŚĆ IMPLEMENTACJI

1. Projekt Next.js + shadcn/ui + Tailwind (setup)
2. Landing page z countdownem
3. Quiz (5 pytań + wynik)
4. Formularz danych z walidacją
5. Strona podsumowania + checkout
6. API /checkout (Stripe Session)
7. API /webhook (Stripe → Supabase)
8. API /generate-docs (PDF + ZIP + Supabase Storage)
9. Strona sukces z pobieraniem
10. Email Resend po zakupie
11. Strona anulowanie
12. Deploy Vercel + domena

Zacznij od kroku 1. Po każdym kroku czekaj na moje "OK" zanim przejdziesz dalej.
```
