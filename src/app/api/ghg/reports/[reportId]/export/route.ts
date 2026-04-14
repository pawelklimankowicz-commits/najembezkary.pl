import { NextResponse } from "next/server";

import { requireGhgRole, writeGhgAuditLog } from "@/lib/ghg/rbac";
import { buildGhgReportExportZip } from "@/lib/ghg/export-report";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

type Params = { params: Promise<{ reportId: string }> };

export async function GET(req: Request, { params }: Params): Promise<Response> {
  const auth = await requireGhgRole(req, "viewer");
  if (!auth.ok) return auth.response;

  const { reportId } = await params;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_report_snapshots")
    .select("id, report_id, payload")
    .eq("report_id", reportId)
    .eq("organization_id", auth.context.orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.payload) {
    return NextResponse.json({ error: "Nie znaleziono snapshotu raportu." }, { status: 404 });
  }

  const zipBuffer = await buildGhgReportExportZip(data.payload as never);
  await writeGhgAuditLog({
    organizationId: auth.context.orgId,
    actorUserId: auth.context.userId,
    action: "report.exported",
    entityType: "ghg_report",
    entityId: reportId,
  });

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="ghg_report_${reportId}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
