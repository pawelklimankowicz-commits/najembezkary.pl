import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { buildDocumentsZipBuffer } from "@/lib/build-documents-zip";
import {
  orderDocumentInputSchema,
  toOrderDocumentBuildInput,
  type OrderDocumentFormInput,
} from "@/lib/order-input-schema";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

async function saveClientSubmission(input: OrderDocumentFormInput) {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : null;
    const userAgent = headersList.get("user-agent");
    const referrer = headersList.get("referer");

    const ownerUnitsJsonRaw = input.quiz_answers.owner_units_json ?? null;
    let ownerUnitsJson: unknown = null;
    if (ownerUnitsJsonRaw) {
      try {
        ownerUnitsJson = JSON.parse(ownerUnitsJsonRaw);
      } catch {
        ownerUnitsJson = ownerUnitsJsonRaw;
      }
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("client_submissions").insert({
      owner_name: input.owner_name,
      owner_city: input.owner_city,
      owner_address: input.owner_address,
      owner_zip: input.owner_zip,
      owner_pesel: input.owner_pesel ?? null,
      owner_identity_document: input.owner_identity_document ?? null,
      email: input.email,
      owner_phone: input.owner_phone,
      property_address: input.property_address,
      property_city: input.property_city,
      property_zip: input.property_zip ?? null,
      property_type: input.property_type,
      property_area: input.property_area ?? null,
      property_floor: input.property_floor ?? null,
      rental_platform: input.rental_platform,
      rental_since: input.rental_since ?? null,
      quiz_q3: input.quiz_answers.q3,
      owner_units_json: ownerUnitsJson,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[client_submissions] Blad zapisu:", error.message);
    }
  } catch (error) {
    console.error("[client_submissions] Nieoczekiwany blad zapisu:", error);
  }
}

export async function POST(req: Request): Promise<Response> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe JSON" }, { status: 400 });
  }

  const parsed = orderDocumentInputSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] || "Nieprawidłowe dane formularza";
    return NextResponse.json({ error: msg, fieldErrors: first }, { status: 400 });
  }

  try {
    await saveClientSubmission(parsed.data);

    const buf = await buildDocumentsZipBuffer(
      toOrderDocumentBuildInput(parsed.data)
    );
    const filename = `najembezkary_dokumenty_${new Date().toISOString().slice(0, 10)}.zip`;
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Nie udało się wygenerować paczki. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
