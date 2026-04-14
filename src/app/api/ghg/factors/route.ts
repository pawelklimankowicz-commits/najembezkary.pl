import { NextResponse } from "next/server";

import { listOfficialEmissionFactors } from "@/lib/ghg/factor-library";
import { requireGhgRole } from "@/lib/ghg/rbac";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const auth = await requireGhgRole(req, "viewer");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider") ?? undefined;
  const year = searchParams.get("year");
  const scope = searchParams.get("scope") ?? undefined;

  const data = listOfficialEmissionFactors({
    provider,
    year: year ? Number(year) : undefined,
    scope,
  });

  return NextResponse.json({ factors: data }, { status: 200 });
}
