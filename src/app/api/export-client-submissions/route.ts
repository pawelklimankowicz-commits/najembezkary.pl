import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

const EXPORT_SECRET = process.env.EXPORT_API_SECRET;

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
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const format = searchParams.get("format") ?? "csv";

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("client_submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (email) query = query.eq("email", email.toLowerCase());
  if (dateFrom) query = query.gte("submitted_at", `${dateFrom}T00:00:00.000Z`);
  if (dateTo) query = query.lte("submitted_at", `${dateTo}T23:59:59.999Z`);

  const { data, error } = await query;
  if (error) {
    console.error("[export-client-submissions] Blad Supabase:", error.message);
    return NextResponse.json({ error: "Blad pobierania danych z bazy." }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "Brak danych.", count: 0 }, { status: 404 });
  }

  if (format === "json") {
    return NextResponse.json({
      meta: {
        generated_at: new Date().toISOString(),
        total_records: data.length,
      },
      data,
    });
  }

  const BOM = "\uFEFF";
  const csvHeader = toCsvRow([
    "ID",
    "Data zgloszenia (UTC)",
    "Email",
    "Telefon",
    "Wlasciciel",
    "Miasto wlasciciela",
    "Adres wlasciciela",
    "Adres lokalu",
    "Miasto lokalu",
    "Kod lokalu",
    "Typ lokalu",
    "Platformy",
    "Rok najmu",
    "Quiz q3",
    "IP",
    "Referrer",
  ]);

  const csvRows = data.map((row) =>
    toCsvRow([
      row.id,
      row.submitted_at,
      row.email,
      row.owner_phone,
      row.owner_name,
      row.owner_city,
      row.owner_address,
      row.property_address,
      row.property_city,
      row.property_zip,
      row.property_type,
      Array.isArray(row.rental_platform) ? row.rental_platform.join("|") : "",
      row.rental_since,
      row.quiz_q3,
      row.ip_address,
      row.referrer,
    ])
  );

  const csvContent = BOM + [csvHeader, ...csvRows].join("\r\n");
  const fileName = `klienci_najembezkary_${new Date().toISOString().slice(0, 10)}.csv`;

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

