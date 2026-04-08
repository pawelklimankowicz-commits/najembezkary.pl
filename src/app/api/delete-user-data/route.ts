import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const EXPORT_SECRET = process.env.EXPORT_API_SECRET;

const RETENTION_NOTICE =
  "Dane finansowe/ksiegowe powiazane z zamowieniami zostaly zanonimizowane, " +
  "ale fakt transakcji (kwota, data, ID zamowienia) zachowany przez 5 lat " +
  "na podstawie art. 74 ust. 2 pkt 6 ustawy o rachunkowosci. " +
  "Log zgod RODO zanonimizowany i zachowany jako dowod wykonania obowiazku " +
  "prawnego na podstawie art. 6 ust. 1 lit. c RODO oraz art. 5 ust. 2 RODO (rozliczalnosc).";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function DELETE(req: NextRequest): Promise<Response> {
  const startedAt = new Date();
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "").trim() ?? "";

  if (!EXPORT_SECRET || apiKey !== EXPORT_SECRET) {
    return NextResponse.json(
      {
        error:
          "Brak autoryzacji. Wymagany naglowek: Authorization: Bearer <EXPORT_API_SECRET>",
      },
      { status: 401 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    request_received_at?: string;
    request_source?: string;
    request_notes?: string;
  };
  const email = body.email;
  const request_received_at = body.request_received_at;
  const request_source = body.request_source ?? "api";
  const request_notes = body.request_notes ?? "";

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: "Wymagane pole: email (poprawny adres e-mail)." },
      { status: 400 }
    );
  }

  const emailLower = email.toLowerCase().trim();
  const requesterIp = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
  const requesterUA = headersList.get("user-agent") ?? null;
  const apiKeyPreview = apiKey.slice(0, 8) + "...";

  let ordersAnonymized = 0;
  let consentsAnonymized = 0;
  let filesDeleted = 0;
  const errors: string[] = [];

  try {
    const supabase = getSupabaseAdmin();
    const resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("id,documents_url")
      .eq("email", emailLower);

    if (ordersErr) errors.push(`Blad pobierania zamowien: ${ordersErr.message}`);
    const orderIds = orders?.map((o) => o.id) ?? [];

    for (const order of orders ?? []) {
      try {
        const filePath = `documents/${order.id}/pakiet_najembezkary.zip`;
        const { error: storageErr } = await supabase.storage
          .from("documents")
          .remove([filePath]);
        if (!storageErr) filesDeleted++;
        else if (!storageErr.message.includes("Not Found")) {
          errors.push(`Storage ${order.id}: ${storageErr.message}`);
        }
      } catch (e) {
        errors.push(`Storage wyjatek ${order.id}: ${String(e)}`);
      }
    }

    if (orderIds.length > 0) {
      const { error: anonOrdersErr, count } = await supabase
        .from("orders")
        .update({
          email: "ZANONIMIZOWANO",
          owner_name: "ZANONIMIZOWANO",
          owner_pesel: null,
          owner_address: "ZANONIMIZOWANO",
          owner_city: "ZANONIMIZOWANO",
          owner_zip: "ZANONIMIZOWANO",
          owner_phone: null,
          property_address: "ZANONIMIZOWANO",
          property_city: "ZANONIMIZOWANO",
          property_zip: "ZANONIMIZOWANO",
          rental_platform: null,
          rental_since: null,
          quiz_answers: null,
          documents_url: null,
          download_token: null,
        })
        .in("id", orderIds);

      if (anonOrdersErr) errors.push(`Anonimizacja orders: ${anonOrdersErr.message}`);
      else ordersAnonymized = count ?? orderIds.length;
    }

    const { error: anonConsentsErr, count: consentsCount } = await supabase
      .from("consents_log")
      .update({
        email: "ZANONIMIZOWANO",
        ip_address: null,
        user_agent: "ZANONIMIZOWANO",
        referrer: null,
      })
      .eq("email", emailLower);

    if (anonConsentsErr) errors.push(`Anonimizacja consents_log: ${anonConsentsErr.message}`);
    else consentsAnonymized = consentsCount ?? 0;

    const status =
      errors.length === 0
        ? "success"
        : ordersAnonymized > 0 || consentsAnonymized > 0
          ? "partial"
          : "failed";

    await supabase.from("deletion_log").insert({
      request_email: emailLower,
      request_received_at: request_received_at ?? startedAt.toISOString(),
      request_source,
      request_notes,
      executed_at: new Date().toISOString(),
      executed_by: "api_automated",
      orders_anonymized: ordersAnonymized,
      consents_anonymized: consentsAnonymized,
      files_deleted: filesDeleted,
      requester_ip: requesterIp,
      requester_user_agent: requesterUA,
      api_key_used: apiKeyPreview,
      status,
      error_details: errors.length > 0 ? errors.join(" | ") : null,
      retained_data_reason: RETENTION_NOTICE,
    });

    if (status !== "failed" && resend) {
      try {
        await resend.emails.send({
          from: "najembezkary.pl <kontakt@najembezkary.pl>",
          to: [emailLower],
          subject: "Potwierdzenie realizacji prawa do bycia zapomnianym — najembezkary.pl",
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
            <h2 style="color:#1a3c5e">Prawo do usuniecia danych — potwierdzenie realizacji</h2>
            <p>Potwierdzamy wykonanie zadania usuniecia danych na podstawie art. 17 RODO.</p>
            <ul>
              <li>Zamowienia zanonimizowane: <strong>${ordersAnonymized}</strong></li>
              <li>Zgody zanonimizowane: <strong>${consentsAnonymized}</strong></li>
              <li>Pliki usuniete: <strong>${filesDeleted}</strong></li>
            </ul>
            <p style="background:#f5f5f5;padding:12px;border-left:3px solid #1a3c5e;font-size:13px">${RETENTION_NOTICE}</p>
          </div>`,
        });
      } catch (emailErr) {
        errors.push(`Email potwierdzajacy: ${String(emailErr)}`);
      }
    }

    return NextResponse.json({
      success: status !== "failed",
      status,
      summary: {
        email: emailLower,
        executed_at: new Date().toISOString(),
        orders_anonymized: ordersAnonymized,
        consents_anonymized: consentsAnonymized,
        files_deleted: filesDeleted,
        retained_data_reason: RETENTION_NOTICE,
        confirmation_email_sent: status !== "failed",
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (unexpectedErr) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("deletion_log").insert({
        request_email: emailLower,
        request_received_at: request_received_at ?? startedAt.toISOString(),
        request_source,
        executed_at: new Date().toISOString(),
        executed_by: "api_automated",
        status: "failed",
        error_details: `Krytyczny blad: ${String(unexpectedErr)}`,
        requester_ip: requesterIp,
        requester_user_agent: requesterUA,
        api_key_used: apiKeyPreview,
        retained_data_reason: RETENTION_NOTICE,
      });
    } catch {
      // ignore logging failure
    }

    return NextResponse.json(
      {
        error: "Krytyczny blad serwera. Operacja nie zostala wykonana.",
        details: String(unexpectedErr),
      },
      { status: 500 }
    );
  }
}

