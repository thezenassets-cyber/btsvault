import { NextResponse } from "next/server";
import { verifyPaymentWingsWebhook } from "@/lib/payments/paymentwings";

/**
 * PaymentWings posts here when a sandbox or live payment completes.
 * Fulfilment trusts this signature, not the browser redirect.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    status?: string;
    txn?: string;
    timestamp?: number | string;
    signature?: string;
    metadata?: string;
  } | null;

  if (!body || !verifyPaymentWingsWebhook(body)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const completed = String(body.status || "").toLowerCase() === "completed";
  return NextResponse.json({
    ok: true,
    completed,
    orderId: body.metadata || null,
    txn: body.txn,
  });
}
