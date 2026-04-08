import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

const EXPORT_SECRET = process.env.EXPORT_API_SECRET;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(fields: unknown[]): string {
  return fields.map(escapeCsv).join(",");
}

export async function GET(req: NextRequest): Promise<Response> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "").trim();

  if (!EXPORT_SECRET || apiKey !== EXPORT_SECRET) {
    return NextResponse.json(
      {
        error:
          "Brak autoryzacji. Wymagany nagłówek: Authorization: Bearer <EXPORT_API_SECRET>",
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const orderId = searchParams.get("order_id");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const format = searchParams.get("format") ?? "csv";

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("consents_log")
    .select(
      `
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
    `
    )
    .order("consented_at", { ascending: false });

  if (email) query = query.eq("email", email);
  if (orderId) query = query.eq("order_id", orderId);
  if (dateFrom) query = query.gte("consented_at", `${dateFrom}T00:00:00.000Z`);
  if (dateTo) query = query.lte("consented_at", `${dateTo}T23:59:59.999Z`);

  const { data: consents, error } = await query;

  if (error) {
    console.error("[export-consents] Błąd Supabase:", error.message);
    return NextResponse.json(
      { error: "Błąd pobierania danych z bazy." },
      { status: 500 }
    );
  }

  if (!consents || consents.length === 0) {
    return NextResponse.json(
      { message: "Brak danych spełniających podane kryteria.", count: 0 },
      { status: 404 }
    );
  }

  if (format === "json") {
    return NextResponse.json(
      {
        meta: {
          generated_at: new Date().toISOString(),
          total_records: consents.length,
          filters: { email, order_id: orderId, date_from: dateFrom, date_to: dateTo },
          purpose: "Raport zgód RODO — najembezkary.pl",
          legal_basis: "Art. 15 RODO — prawo dostępu osoby, której dane dotyczą",
        },
        data: consents,
      },
      { status: 200 }
    );
  }

  const BOM = "\uFEFF";

  const csvHeader = toCsvRow([
    "ID zgody",
    "ID zamówienia",
    "ID sesji",
    "Adres e-mail",
    "Regulamin zaakceptowany",
    "Zgoda na treści cyfrowe (art. 38 pkt 13 u.p.k.)",
    "Zgoda na cookies analityczne",
    "Zgoda marketingowa",
    "Wersja Regulaminu",
    "Wersja Polityki prywatności",
    "Adres IP",
    "Przeglądarka (User-Agent)",
    "Strona odsyłająca (Referrer)",
    "Data i czas zgody (UTC)",
    "Data i czas zapisu (UTC)",
  ]);

  const csvRows = consents.map((c) =>
    toCsvRow([
      c.id,
      c.order_id ?? "",
      c.session_id ?? "",
      c.email ?? "",
      c.terms_accepted ? "TAK" : "NIE",
      c.digital_content_consent ? "TAK" : "NIE",
      c.analytics_consent ? "TAK" : "NIE",
      c.marketing_consent ? "TAK" : "NIE",
      c.terms_version ?? "",
      c.privacy_policy_version ?? "",
      c.ip_address ?? "",
      c.user_agent ?? "",
      c.referrer ?? "",
      c.consented_at ?? "",
      c.created_at ?? "",
    ])
  );

  const metaLines = [
    toCsvRow(["RAPORT ZGÓD RODO — najembezkary.pl"]),
    toCsvRow(["Wygenerowano:", new Date().toISOString()]),
    toCsvRow(["Łączna liczba rekordów:", String(consents.length)]),
    toCsvRow(["Filtr email:", email ?? "(brak)"]),
    toCsvRow(["Filtr ID zamówienia:", orderId ?? "(brak)"]),
    toCsvRow(["Filtr data od:", dateFrom ?? "(brak)"]),
    toCsvRow(["Filtr data do:", dateTo ?? "(brak)"]),
    toCsvRow([
      "Podstawa prawna raportu:",
      "Art. 15 RODO — prawo dostępu do danych",
    ]),
    toCsvRow([""]),
  ];

  const csvContent = BOM + [...metaLines, csvHeader, ...csvRows].join("\r\n");
  const fileName = `zgody_rodo_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store, no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

