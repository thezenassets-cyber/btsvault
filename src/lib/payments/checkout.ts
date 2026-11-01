import type { Order } from "@/lib/types";
import {
  createPaymentIntent,
  quoteTotals,
  type CheckoutPayload,
} from "@/lib/payments/types";

/** Demo checkout processor (client-safe). Stripe seam lives in createPaymentIntent. */
export async function submitCheckout(
  body: CheckoutPayload
): Promise<{ orderId: string; status: Order["status"]; order: Order } | { error: string }> {
  if (!body?.shipping?.email || !body?.items?.length) {
    return { error: "Invalid checkout payload" };
  }

  const orderId = `AV-${Date.now().toString(36).toUpperCase()}`;
  const { shippingFee, tax, total } = quoteTotals(
    body.items,
    body.shipping.country || "US",
    body.subtotal
  );

  const payment = await createPaymentIntent({
    amount: total,
    currency: body.currency || "USD",
    orderId,
    customerEmail: body.shipping.email,
  });

  const order: Order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: payment.status === "succeeded" ? "paid_demo" : "pending",
    shipping: body.shipping,
    payment: body.payment,
    items: body.items,
    subtotal: body.subtotal,
    shippingFee,
    tax,
    total,
    currency: body.currency || "USD",
    clientCardNumber: body.clientCardNumber,
  };

  return {
    orderId: order.id,
    status: order.status,
    order,
  };
}
