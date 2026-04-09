import { NextResponse } from "next/server";

import { getStripeServer } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ paid: false, error: "Brak session_id." }, { status: 400 });
    }

    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    return NextResponse.json({ paid, status: session.payment_status });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd weryfikacji płatności.";
    return NextResponse.json({ paid: false, error: message }, { status: 500 });
  }
}
