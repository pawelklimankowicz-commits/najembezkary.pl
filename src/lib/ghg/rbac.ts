import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

const roleOrder = ["viewer", "reviewer", "editor", "admin", "owner"] as const;
type Role = (typeof roleOrder)[number];

export type GhgRequestContext = {
  orgId: string;
  userId: string;
  role: Role;
};

function roleMeets(required: Role, actual: Role): boolean {
  return roleOrder.indexOf(actual) >= roleOrder.indexOf(required);
}

export async function requireGhgRole(
  req: Request,
  minimumRole: Role
): Promise<{ ok: true; context: GhgRequestContext } | { ok: false; response: NextResponse }> {
  const orgId = req.headers.get("x-org-id");
  const userId = req.headers.get("x-user-id");
  if (!orgId || !userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Brak x-org-id lub x-user-id." },
        { status: 401 }
      ),
    };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("ghg_memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Użytkownik nie należy do organizacji." },
        { status: 403 }
      ),
    };
  }

  const role = data.role as Role;
  if (!roleMeets(minimumRole, role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Wymagana rola: ${minimumRole}.` },
        { status: 403 }
      ),
    };
  }

  return { ok: true, context: { orgId, userId, role } };
}

export async function writeGhgAuditLog(input: {
  organizationId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = getSupabaseServerClient();
  await supabase.from("ghg_audit_logs").insert({
    organization_id: input.organizationId,
    actor_user_id: input.actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    metadata: input.metadata ?? null,
  });
}
