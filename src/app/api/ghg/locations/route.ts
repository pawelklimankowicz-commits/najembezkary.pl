import { NextResponse } from "next/server";
import { z } from "zod";

import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const createLocationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  countryCode: z.string().trim().length(2).default("PL"),
  city: z.string().trim().max(120).optional(),
  addressLine: z.string().trim().max(200).optional(),
});

export async function GET(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "viewer");
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_locations")
    .select("*")
    .eq("organization_id", auth.context.orgId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ locations: data ?? [] }, { status: 200 });
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "editor");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane lokalizacji." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_locations")
    .insert({
      organization_id: auth.context.orgId,
      name: parsed.data.name,
      country_code: parsed.data.countryCode.toUpperCase(),
      city: parsed.data.city ?? null,
      address_line: parsed.data.addressLine ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Błąd zapisu lokalizacji." },
      { status: 400 }
    );
  }

  await writeGhgAuditLog({
    organizationId: auth.context.orgId,
    actorUserId: auth.context.userId,
    action: "location.created",
    entityType: "ghg_location",
    entityId: data.id,
  });

  return NextResponse.json({ location: data }, { status: 201 });
}
