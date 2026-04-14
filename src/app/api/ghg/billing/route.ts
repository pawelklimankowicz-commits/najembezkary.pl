import { NextResponse } from "next/server";

import { requireGhgRole } from "@/lib/ghg/rbac";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "viewer");
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_billing_accounts")
    .select("*")
    .eq("organization_id", auth.context.orgId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ billing: data }, { status: 200 });
}
