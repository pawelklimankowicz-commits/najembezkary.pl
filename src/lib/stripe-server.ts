import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Brak STRIPE_SECRET_KEY w zmiennych środowiskowych.");
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  return stripeClient;
}

export function getAppUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}
