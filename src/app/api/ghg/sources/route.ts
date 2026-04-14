import { NextResponse } from "next/server";
import { z } from "zod";

import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const createSourceSchema = z.object({
  locationId: z.string().uuid().optional(),
  sourceKey: z.string().trim().min(1),
  sourceName: z.string().trim().min(2),
  scope: z.enum(["scope1", "scope2", "scope3"]),
  method: z.string().trim().min(2),
  defaultActivityUnit: z.string().trim().min(1),
});

export async function GET(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "viewer");
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_emission_sources")
    .select("*")
    .eq("organization_id", auth.context.orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ sources: data ?? [] }, { status: 200 });
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "editor");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane źródła." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_emission_sources")
    .insert({
      organization_id: auth.context.orgId,
      location_id: parsed.data.locationId ?? null,
      source_key: parsed.data.sourceKey,
      source_name: parsed.data.sourceName,
      scope: parsed.data.scope,
      method: parsed.data.method,
      default_activity_unit: parsed.data.defaultActivityUnit,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Błąd zapisu źródła." }, { status: 400 });
  }

  await writeGhgAuditLog({
    organizationId: auth.context.orgId,
    actorUserId: auth.context.userId,
    action: "source.created",
    entityType: "ghg_emission_source",
    entityId: data.id,
  });

  return NextResponse.json({ source: data }, { status: 201 });
}
