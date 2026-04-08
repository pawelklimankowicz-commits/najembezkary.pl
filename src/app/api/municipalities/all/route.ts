import { NextResponse } from "next/server";

import { MUNICIPALITIES_FALLBACK } from "@/lib/municipalities-fallback";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ results: MUNICIPALITIES_FALLBACK });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("municipalities")
      .select(
        "teryt_code,name,full_name,type,voivodeship,office_name,office_address,office_phone,office_bip_url,accepts_epuap,accepts_mail,accepts_in_person"
      )
      .order("name", { ascending: true })
      .limit(3000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd pobierania listy gmin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
