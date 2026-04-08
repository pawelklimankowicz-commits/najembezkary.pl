import { NextResponse } from "next/server";

import { MUNICIPALITIES_FALLBACK } from "@/lib/municipalities-fallback";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const qq = q.toLowerCase();
      const local = MUNICIPALITIES_FALLBACK.filter(
        (m) =>
          m.name.toLowerCase().includes(qq) ||
          m.full_name.toLowerCase().includes(qq) ||
          m.voivodeship.toLowerCase().includes(qq)
      );
      return NextResponse.json({ results: local });
    }
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("municipalities")
      .select(
        "teryt_code,name,full_name,type,voivodeship,office_name,office_address,office_phone,office_bip_url,accepts_epuap,accepts_mail,accepts_in_person"
      )
      .or(`name.ilike.%${q}%,full_name.ilike.%${q}%,voivodeship.ilike.%${q}%`)
      .limit(80);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ results: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd wyszukiwania gmin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
