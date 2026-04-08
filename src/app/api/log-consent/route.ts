import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

const TERMS_VERSION = "2026-04-04";
const PRIVACY_POLICY_VERSION = "2026-04-04";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = (await req.json()) as {
      termsAccepted?: boolean;
      digitalContentConsent?: boolean;
      analyticsConsent?: boolean;
      marketingConsent?: boolean;
      email?: string;
      sessionId?: string;
      orderId?: string;
    };

    const termsAccepted = Boolean(body.termsAccepted);
    const digitalContentConsent = Boolean(body.digitalContentConsent);

    if (!termsAccepted || !digitalContentConsent) {
      return NextResponse.json(
        { error: "Wymagane zgody nie zostaly udzielone." },
        { status: 400 }
      );
    }

    const email = body.email?.toLowerCase().trim() ?? null;
    const sessionId = body.sessionId ?? null;
    const orderId = body.orderId ?? null;

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : null;
    const userAgent = headersList.get("user-agent") ?? null;
    const referrer = headersList.get("referer") ?? null;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("consents_log")
      .insert({
        order_id: orderId,
        session_id: sessionId,
        terms_accepted: termsAccepted,
        digital_content_consent: digitalContentConsent,
        analytics_consent: Boolean(body.analyticsConsent),
        marketing_consent: Boolean(body.marketingConsent),
        terms_version: TERMS_VERSION,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer,
        email,
        consented_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[consents_log] Blad zapisu:", error.message);
      return NextResponse.json({ error: "Blad zapisu zgody." }, { status: 500 });
    }

    return NextResponse.json({ success: true, consentId: data.id });
  } catch (err) {
    console.error("[consents_log] Nieoczekiwany blad:", err);
    return NextResponse.json({ error: "Blad serwera." }, { status: 500 });
  }
}

