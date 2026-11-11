import { createHash, timingSafeEqual } from "crypto";

const API = "https://api.paymentwings.com";

export function paymentWingsConfigured() {
  return Boolean(process.env.PAYMENTWINGS_PUBLIC_KEY && process.env.PAYMENTWINGS_PRIVATE_KEY);
}

export async function createPaymentWingsCheckout(input: {
  amount: number;
  currency: string;
  email: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}) {
  const pub = process.env.PAYMENTWINGS_PUBLIC_KEY;
  const sec = process.env.PAYMENTWINGS_PRIVATE_KEY;
  if (!pub || !sec) throw new Error("PaymentWings keys are not configured");

  const response = await fetch(`${API}/api/v2/payment/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pub}:${sec}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100) / 100,
      currency: input.currency,
      customer_email: input.email,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      webhook_url: input.webhookUrl,
      metadata: input.orderId,
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    ok?: boolean;
    error?: { message?: string };
    data?: { url?: string; transaction_id?: string; mode?: string };
  } | null;

  if (!response.ok || !payload?.ok || !payload.data?.url || !payload.data.transaction_id) {
    throw new Error(payload?.error?.message || "PaymentWings could not start checkout");
  }

  return {
    url: payload.data.url,
    transactionId: payload.data.transaction_id,
    mode: payload.data.mode || "live",
  };
}

/** Server-side check. A buyer return counts only when this transaction is COMPLETED for the same amount. */
export async function lookupPaymentWings(transactionId: string) {
  const response = await fetch(`${API}/api/lookup/${encodeURIComponent(transactionId)}`);
  const payload = (await response.json().catch(() => null)) as {
    data?: { status?: string; amount?: string | number; currency?: string };
  } | null;
  const amount = Number(payload?.data?.amount);
  return {
    status: String(payload?.data?.status || "").toUpperCase(),
    amount: Number.isFinite(amount) ? amount : null,
    currency: payload?.data?.currency || "",
  };
}

export function paymentAmountsMatch(paid: number | null, expected: number) {
  if (paid == null || !Number.isFinite(expected)) return false;
  return Math.abs(paid - expected) < 0.02;
}

/** md5(txn|timestamp|webhook_key), compared without leaking which side failed. */
export function verifyPaymentWingsWebhook(body: {
  txn?: unknown;
  timestamp?: unknown;
  signature?: unknown;
}) {
  const key = process.env.PAYMENTWINGS_WEBHOOK_KEY;
  if (!key || typeof body.txn !== "string" || body.timestamp == null || typeof body.signature !== "string") {
    return false;
  }
  const expected = createHash("md5").update(`${body.txn}|${body.timestamp}|${key}`).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(body.signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
