import { NextResponse } from "next/server";
import { createPaymentWingsCheckout, paymentWingsConfigured } from "@/lib/payments/paymentwings";

const RETURN_HOSTS = new Set(["armyvault.site", "www.armyvault.site", "127.0.0.1", "localhost"]);

function returnOrigin(requested: string | undefined, fallback: string) {
  try {
    const url = new URL(requested || fallback);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || !RETURN_HOSTS.has(url.hostname)) {
      return fallback;
    }
    return url.origin;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  if (!paymentWingsConfigured()) {
    return NextResponse.json({ error: "PaymentWings is not configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    amount?: number;
    currency?: string;
    email?: string;
    orderId?: string;
    origin?: string;
  } | null;

  const amount = Number(body?.amount);
  const email = body?.email?.trim() || "";
  const orderId = body?.orderId?.trim() || "";
  if (!orderId || !email.includes("@") || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Add an email and a total before checkout" }, { status: 400 });
  }

  const origin = returnOrigin(body?.origin, new URL(request.url).origin);
  const site = process.env.PAYMENTWINGS_SITE_URL || origin;

  try {
    const session = await createPaymentWingsCheckout({
      amount,
      currency: body?.currency || "USD",
      email,
      orderId,
      successUrl: `${origin}/checkout/success?order=${encodeURIComponent(orderId)}&provider=paymentwings`,
      cancelUrl: `${origin}/checkout?canceled=1`,
      webhookUrl: `${site}/api/payments/paymentwings/webhook`,
    });
    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "PaymentWings could not start checkout";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
