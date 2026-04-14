import { NextResponse } from "next/server";
import { z } from "zod";

import { getStripeServer } from "@/lib/stripe-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const bootstrapSchema = z.object({
  userId: z.string().trim().min(2),
  organizationName: z.string().trim().min(2),
  countryCode: z.string().trim().length(2).default("PL"),
  email: z.string().email(),
  planCode: z.enum(["starter", "growth", "enterprise"]).default("starter"),
});

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null);
  const parsed = bootstrapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane tenant bootstrap." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: org, error: orgError } = await supabase
    .from("ghg_organizations")
    .insert({
      name: parsed.data.organizationName,
      country_code: parsed.data.countryCode.toUpperCase(),
    })
    .select("id, name")
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: orgError?.message ?? "Błąd tworzenia organizacji." }, { status: 400 });
  }

  await supabase.from("ghg_memberships").insert({
    organization_id: org.id,
    user_id: parsed.data.userId,
    role: "owner",
  });

  const stripe = getStripeServer();
  const customer = await stripe.customers.create({
    email: parsed.data.email,
    name: parsed.data.organizationName,
    metadata: {
      ghgOrganizationId: org.id,
      ghgPlanCode: parsed.data.planCode,
    },
  });

  await supabase.from("ghg_billing_accounts").insert({
    organization_id: org.id,
    stripe_customer_id: customer.id,
    plan_code: parsed.data.planCode,
    subscription_status: "trialing",
  });

  return NextResponse.json(
    {
      organizationId: org.id,
      organizationName: org.name,
      stripeCustomerId: customer.id,
      ownerUserId: parsed.data.userId,
    },
    { status: 201 }
  );
}
