import { NextResponse } from "next/server";

import { calculateGhgReport } from "@/lib/ghg/calculate-report";
import { ghgReportRequestSchema } from "@/lib/ghg/types";
import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

function extractErrorMessage(fieldErrors: JsonObject): string {
  for (const value of Object.values(fieldErrors)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }
  return "Nieprawidłowe dane wejściowe raportu.";
}

async function persistReportSnapshot(input: {
  organizationId: string;
  reportingPeriodId: string;
  inventoryBoundary: string;
  consolidationApproach: string;
  report: ReturnType<typeof calculateGhgReport>;
  actorUserId: string;
}) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: reportRow, error: reportError } = await supabase
      .from("ghg_reports")
      .insert({
        organization_id: input.organizationId,
        reporting_period_id: input.reportingPeriodId,
        report_year: input.report.reportYear,
        company_name: input.report.companyName,
        inventory_boundary: input.inventoryBoundary,
        consolidation_approach: input.consolidationApproach,
        status: "draft",
      })
      .select("id")
      .single();

    if (reportError || !reportRow) {
      console.error("[ghg_reports] Blad zapisu:", reportError?.message);
      return;
    }

    const activitiesRows = input.report.activities.map((activity) => ({
      report_id: reportRow.id,
      source_key: activity.sourceKey,
      source_name: activity.sourceName,
      scope: activity.scope,
      method: activity.method,
      period_start: activity.periodStart,
      period_end: activity.periodEnd,
      activity_amount: activity.activityAmount,
      activity_unit: activity.activityUnit,
      emission_factor: activity.emissionFactor,
      emission_factor_unit: activity.emissionFactorUnit,
      uncertainty_pct: activity.uncertaintyPct,
      co2e_kg: activity.co2eKg,
    }));

    const { error: activityError } = await supabase
      .from("ghg_report_activities")
      .insert(activitiesRows);

    if (activityError) {
      console.error("[ghg_report_activities] Blad zapisu:", activityError.message);
      return;
    }

    const { error } = await supabase.from("ghg_report_snapshots").insert({
      organization_id: input.organizationId,
      report_id: reportRow.id,
      report_year: input.report.reportYear,
      company_name: input.report.companyName,
      total_co2e_kg: input.report.summary.totalCo2eKg,
      scope1_co2e_kg: input.report.summary.scope1Kg,
      scope2_co2e_kg: input.report.summary.scope2Kg,
      scope3_co2e_kg: input.report.summary.scope3Kg,
      uncertainty_kg: input.report.summary.uncertaintyKg,
      payload: input.report,
    });

    if (error) {
      console.error("[ghg_report_snapshots] Blad zapisu:", error.message);
      return;
    }

    await writeGhgAuditLog({
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: "report.created",
      entityType: "ghg_report",
      entityId: reportRow.id,
      metadata: { status: "draft", activityCount: input.report.activities.length },
    });
  } catch (error) {
    console.error("[ghg_report_snapshots] Nieoczekiwany blad zapisu:", error);
  }
}

export async function POST(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "editor");
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowy JSON." }, { status: 400 });
  }

  const parsed = ghgReportRequestSchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as JsonObject;
    return NextResponse.json(
      {
        error: extractErrorMessage(fieldErrors),
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const report = calculateGhgReport(parsed.data);
  await persistReportSnapshot({
    organizationId: parsed.data.organizationId,
    reportingPeriodId: parsed.data.reportingPeriodId,
    inventoryBoundary: parsed.data.inventoryBoundary,
    consolidationApproach: parsed.data.consolidationApproach,
    report,
    actorUserId: auth.context.userId,
  });

  return NextResponse.json(report, { status: 200 });
}

export async function GET(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "viewer");
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_reports")
    .select("id, report_year, company_name, status, created_at, approved_at")
    .eq("organization_id", auth.context.orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reports: data ?? [] }, { status: 200 });
}
