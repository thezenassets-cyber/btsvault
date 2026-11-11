import { NextResponse } from "next/server";
import { lookupPaymentWings, paymentAmountsMatch } from "@/lib/payments/paymentwings";

/** Confirms a return against PaymentWings. The browser redirect alone is not a purchase. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const txn = url.searchParams.get("txn")?.trim() || "";
  const expected = Number(url.searchParams.get("amount"));
  if (!txn || !Number.isFinite(expected) || expected <= 0) {
    return NextResponse.json({ completed: false }, { status: 400 });
  }

  try {
    const payment = await lookupPaymentWings(txn);
    const completed = payment.status === "COMPLETED" && paymentAmountsMatch(payment.amount, expected);
    return NextResponse.json({ completed });
  } catch {
    return NextResponse.json({ completed: false }, { status: 502 });
  }
}
