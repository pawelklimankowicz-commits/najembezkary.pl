import { NextResponse } from "next/server";
import { z } from "zod";

import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const workflowSchema = z.object({
  reportId: z.string().uuid(),
  action: z.enum(["submit_for_review", "request_changes", "approve"]),
  comment: z.string().trim().max(1200).optional(),
});

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null);
  const parsed = workflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane workflow." }, { status: 400 });
  }

  const requiredRole =
    parsed.data.action === "submit_for_review"
      ? "editor"
      : ("reviewer" as const);
  const auth = await requireGhgRole(req, requiredRole);
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServerClient();
  const { data: report, error: reportError } = await supabase
    .from("ghg_reports")
    .select("id, organization_id, status")
    .eq("id", parsed.data.reportId)
    .eq("organization_id", auth.context.orgId)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Nie znaleziono raportu." }, { status: 404 });
  }

  let nextStatus = report.status;
  if (parsed.data.action === "submit_for_review" && report.status === "draft") {
    nextStatus = "in_review";
    await supabase.from("ghg_reports").update({
      status: nextStatus,
      submitted_by_user_id: auth.context.userId,
      submitted_at: new Date().toISOString(),
    }).eq("id", report.id);
  }

  if (parsed.data.action === "request_changes" && report.status === "in_review") {
    nextStatus = "draft";
    await supabase.from("ghg_reports").update({ status: nextStatus }).eq("id", report.id);
    await supabase.from("ghg_report_reviews").insert({
      report_id: report.id,
      reviewer_user_id: auth.context.userId,
      decision: "changes_requested",
      comment: parsed.data.comment ?? null,
    });
  }

  if (parsed.data.action === "approve" && report.status === "in_review") {
    nextStatus = "approved";
    await supabase.from("ghg_reports").update({
      status: nextStatus,
      approved_by_user_id: auth.context.userId,
      approved_at: new Date().toISOString(),
    }).eq("id", report.id);
    await supabase.from("ghg_report_reviews").insert({
      report_id: report.id,
      reviewer_user_id: auth.context.userId,
      decision: "approved",
      comment: parsed.data.comment ?? null,
    });
  }

  await writeGhgAuditLog({
    organizationId: auth.context.orgId,
    actorUserId: auth.context.userId,
    action: `report.workflow.${parsed.data.action}`,
    entityType: "ghg_report",
    entityId: report.id,
    metadata: { status: nextStatus, comment: parsed.data.comment ?? null },
  });

  return NextResponse.json({ reportId: report.id, status: nextStatus }, { status: 200 });
}
