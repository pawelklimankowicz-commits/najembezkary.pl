import { NextResponse } from "next/server";
import { z } from "zod";

import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const createPeriodSchema = z.object({
  label: z.string().trim().min(2).max(120),
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
});

export async function POST(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "editor");
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createPeriodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane okresu." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_reporting_periods")
    .insert({
      organization_id: auth.context.orgId,
      label: parsed.data.label,
      period_start: parsed.data.periodStart,
      period_end: parsed.data.periodEnd,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Błąd zapisu okresu." }, { status: 400 });
  }

  await writeGhgAuditLog({
    organizationId: auth.context.orgId,
    actorUserId: auth.context.userId,
    action: "period.created",
    entityType: "ghg_reporting_period",
    entityId: data.id,
  });

  return NextResponse.json({ period: data }, { status: 201 });
}
