import { NextResponse } from "next/server";

import { listOfficialEmissionFactors } from "@/lib/ghg/factor-library";
import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "admin");
  if (!auth.ok) return auth.response;

  const factors = listOfficialEmissionFactors();
  const supabase = getSupabaseServerClient();

  const rows = factors.map((factor) => ({
    source_key: `${factor.provider.toLowerCase()}_${factor.sourceKey}_${factor.year}`,
    activity_unit: factor.activityUnit,
    emission_factor: factor.emissionFactor,
    factor_unit: factor.factorUnit,
    scope: factor.scope,
    method: factor.method,
    valid_from: `${factor.year}-01-01`,
    valid_to: `${factor.year}-12-31`,
    source_reference: `${factor.provider}: ${factor.sourceReference}`,
  }));

  const { error } = await supabase.from("ghg_emission_factors").upsert(rows, {
    onConflict: "source_key,activity_unit,valid_from",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeGhgAuditLog({
    organizationId: auth.context.orgId,
    actorUserId: auth.context.userId,
    action: "factors.synced",
    entityType: "ghg_emission_factor",
    entityId: "batch",
    metadata: { count: rows.length },
  });

  return NextResponse.json({ synced: rows.length }, { status: 200 });
}
