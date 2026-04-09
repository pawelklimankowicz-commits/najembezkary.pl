import { NextResponse } from "next/server";

import { getPackagePricing } from "@/lib/pricing";
import { getAppUrl, getStripeServer } from "@/lib/stripe-server";

export const runtime = "nodejs";

type CreateCheckoutBody = {
  propertyCount?: number;
  customerEmail?: string;
  customerName?: string;
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateCheckoutBody;
    const pricing = getPackagePricing(body.propertyCount);

    if (pricing.isCustomQuote || pricing.total === null) {
      return NextResponse.json(
        { error: "Dla 11+ lokali obowiązuje wycena indywidualna." },
        { status: 400 }
      );
    }

    const stripe = getStripeServer();
    const appUrl = getAppUrl();
    const amountGross = Math.max(1, Math.round(pricing.total * 100));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "pl",
      payment_method_types: ["card", "blik", "p24"],
      success_url: `${appUrl}/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/anulowanie`,
      customer_email: body.customerEmail || undefined,
      metadata: {
        propertyCount: String(pricing.propertyCount),
        customerName: body.customerName || "",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: amountGross,
            product_data: {
              name: `Pakiet dokumentów najembezkary.pl (${pricing.propertyCount} lok.)`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json({ error: "Nie udało się utworzyć sesji płatności." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Błąd tworzenia sesji Stripe.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
