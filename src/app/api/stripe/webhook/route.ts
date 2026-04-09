import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripeServer } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Brak STRIPE_WEBHOOK_SECRET." }, { status: 500 });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Brak nagłówka stripe-signature." }, { status: 400 });
    }

    const payload = await req.text();
    const stripe = getStripeServer();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      // Miejsce na zapis statusu płatności do bazy.
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Stripe checkout.session.completed", session.id);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd webhooka Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
