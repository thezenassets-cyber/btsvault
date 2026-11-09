import type { Order, PaymentDetails, ShippingAddress } from "@/lib/types";

export type PaymentProvider = "demo" | "stripe";

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
}

export interface CreatePaymentIntentResult {
  provider: PaymentProvider;
  clientSecret: string | null;
  status: "requires_payment_method" | "succeeded" | "processing";
  paymentIntentId: string;
}

/**
 * Stripe-ready seam. Demo implementation settles immediately.
 * Swap body for Stripe PaymentIntents when keys are configured.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<CreatePaymentIntentResult> {
  const useStripe = Boolean(process.env.STRIPE_SECRET_KEY);

  if (!useStripe) {
    return {
      provider: "demo",
      clientSecret: null,
      status: "succeeded",
      paymentIntentId: `demo_pi_${input.orderId}`,
    };
  }

  // Placeholder for future Stripe integration — keep UI unchanged.
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const intent = await stripe.paymentIntents.create({ ... });
  return {
    provider: "stripe",
    clientSecret: null,
    status: "requires_payment_method",
    paymentIntentId: `stripe_pending_${input.orderId}`,
  };
}

export function estimateTax(subtotal: number, country: string) {
  if (country === "US") return Math.round(subtotal * 0.08 * 100) / 100;
  if (country === "KR") return Math.round(subtotal * 0.1 * 100) / 100;
  return Math.round(subtotal * 0.05 * 100) / 100;
}

export function estimateShipping(subtotal: number, country: string) {
  if (subtotal >= 150) return 0;
  if (country === "US") return 8.5;
  return 18;
}

export type CheckoutPayload = {
  shipping: ShippingAddress;
  payment: PaymentDetails;
  items: Order["items"];
  subtotal: number;
  currency: string;
  clientCardNumber?: string;
  /** Hosted checkout. Chat remains a support channel. */
  channel?: "tawk" | "card" | "paymentwings";
};

/** Shipping follows merch only. Seat tickets are digital and do not add a shipping fee. */
export function quoteTotals(
  items: Order["items"],
  country: string,
  subtotal: number,
  options?: { desk?: boolean }
) {
  if (options?.desk) {
    return { shippingFee: 0, tax: 0, total: Math.round(subtotal * 100) / 100 };
  }
  const merchSubtotal = items
    .filter((item) => !item.seat)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = merchSubtotal > 0 ? estimateShipping(merchSubtotal, country) : 0;
  const tax = estimateTax(subtotal, country);
  const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;
  return { shippingFee, tax, total };
}
