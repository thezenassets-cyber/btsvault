"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, MapPin, ShoppingBag } from "lucide-react";
import { lineUnitPrice, useCart } from "@/components/cart/cart-context";
import { useOrders } from "@/components/cart/order-context";
import { useClientCard } from "@/components/client-card/client-card-context";
import { ClientCard } from "@/components/client-card/client-card";
import { getProductById } from "@/data/products";
import { admitCode } from "@/data/seating";
import { formatDate, formatPrice } from "@/lib/utils";
import { submitCheckout } from "@/lib/payments/checkout";
import { quoteTotals } from "@/lib/payments/types";
import type { OrderLineItem, PaymentDetails, ShippingAddress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STEPS = ["Cart", "Shipping", "Review"] as const;

const emptyShipping: ShippingAddress = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export function CheckoutClient() {
  const router = useRouter();
  const { items, ready, grandTotal, clearCart } = useCart();
  const { saveOrder } = useOrders();
  const { profile, ready: cardReady } = useClientCard();
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lineItems: OrderLineItem[] = useMemo(
    () =>
      items
        .map((item) => {
          if (item.seat) {
            const access = item.seat.privateAccess;
            const code = admitCode(
              item.seat.concertId,
              item.seat.sectionId,
              item.seat.row,
              item.seat.seat
            );
            const seatLabel = `${code} · ${item.seat.city} · ${item.seat.sectionId} ${item.seat.sectionLabel} · Row ${item.seat.row} Seat ${item.seat.seat}`;
            return {
              productId: item.productId,
              name: access ? `${seatLabel} — ${access.title}` : seatLabel,
              quantity: 1,
              unitPrice: lineUnitPrice(item),
              image: item.seat.image,
              lineId: item.lineId,
              seat: item.seat,
            } satisfies OrderLineItem;
          }
          const product = getProductById(item.productId);
          if (!product) return null;
          return {
            productId: product.id,
            name: product.name,
            quantity: item.quantity,
            unitPrice: lineUnitPrice(item),
            selectedSize: item.selectedSize,
            image: product.image,
          } satisfies OrderLineItem;
        })
        .filter(Boolean) as OrderLineItem[],
    [items]
  );

  const checkoutGroups = useMemo(() => {
    const shows = new Map<string, { label: string; items: OrderLineItem[] }>();
    const merch: OrderLineItem[] = [];
    for (const item of lineItems) {
      if (!item.seat) {
        merch.push(item);
        continue;
      }
      const key = item.seat.concertId;
      const group = shows.get(key) ?? {
        label: `${item.seat.city} · ${formatDate(item.seat.date)}`,
        items: [],
      };
      group.items.push(item);
      shows.set(key, group);
    }
    return { shows: [...shows.values()], merch };
  }, [lineItems]);

  const { shippingFee, tax, total } = quoteTotals(lineItems, shipping.country || "US", grandTotal);

  const paymentPreview: PaymentDetails = {
    cardholderName: profile.holderName,
    last4: profile.number.replace(/\D/g, "").slice(-4),
    brand: "Client Card",
  };

  async function placeOrder() {
    setSubmitting(true);
    setError(null);
    try {
      const data = await submitCheckout({
        shipping,
        payment: paymentPreview,
        items: lineItems,
        subtotal: grandTotal,
        currency: "USD",
        clientCardNumber: profile.number,
      });
      if ("error" in data) throw new Error(data.error);
      saveOrder(data.order);
      clearCart();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="px-4 py-24 text-center text-cream/50">Loading your cart…</div>;
  }

  if (items.length === 0 && step === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-cream/30" />
        <h1 className="text-2xl font-bold text-cream">Your cart is empty</h1>
        <p className="mt-2 text-cream/50">Browse member shops and pile up your drop.</p>
        <Link href="/members" className="mt-6 inline-block">
          <Button>Shop by Member</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-cream">Checkout</h1>
      <p className="mt-1 text-sm text-cream/50">Your order is placed on your Client Card.</p>

      <ol className="mt-8 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              i === step
                ? "bg-purple-main text-white"
                : i < step
                  ? "bg-purple-main/30 text-purple-glow"
                  : "bg-white/5 text-cream/40"
            }`}
          >
            {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          {step === 0 && (
            <section className="rounded-2xl glass p-6">
              <h2 className="mb-4 text-lg font-semibold text-cream">Cart review</h2>
              <div className="space-y-6">
                {checkoutGroups.shows.map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-xs font-semibold tracking-widest text-gold uppercase">
                      {group.label}
                    </p>
                    <ul className="space-y-4">
                      {group.items.map((item) => (
                        <CheckoutLine key={item.lineId ?? item.name} item={item} />
                      ))}
                    </ul>
                  </div>
                ))}
                {checkoutGroups.merch.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-semibold tracking-widest text-cream/40 uppercase">
                      Merch
                    </p>
                    <ul className="space-y-4">
                      {checkoutGroups.merch.map((item) => (
                        <CheckoutLine
                          key={item.lineId ?? `${item.productId}-${item.selectedSize ?? ""}`}
                          item={item}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button className="mt-6 w-full" onClick={() => setStep(1)}>
                Continue to shipping
              </Button>
            </section>
          )}

          {step === 1 && (
            <section className="rounded-2xl glass p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cream">
                <MapPin className="h-5 w-5 text-purple-glow" /> Shipping
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["fullName", "Full name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["line1", "Address"],
                    ["line2", "Apt / suite"],
                    ["city", "City"],
                    ["state", "State / province"],
                    ["postalCode", "Postal code"],
                    ["country", "Country code"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className={`block text-xs text-cream/50 ${key === "line1" || key === "email" || key === "fullName" ? "sm:col-span-2" : ""}`}>
                    {label}
                    <Input
                      className="mt-1"
                      value={shipping[key] ?? ""}
                      onChange={(e) => setShipping((s) => ({ ...s, [key]: e.target.value }))}
                      required={key !== "line2"}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!shipping.fullName || !shipping.email || !shipping.line1 || !shipping.city) {
                      setError("Please complete shipping details");
                      return;
                    }
                    setError(null);
                    setStep(2); // review
                  }}
                >
                  Review order
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-2xl glass p-6">
              <h2 className="mb-4 text-lg font-semibold text-cream">Review & place order</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-cream/50">Ship to</dt>
                  <dd className="text-right text-cream">
                    {shipping.fullName}
                    <br />
                    {shipping.line1}, {shipping.city}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-cream/50">Client Card</dt>
                  <dd className="font-mono text-cream">{cardReady ? profile.number : ""}</dd>
                </div>
              </dl>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={placeOrder} disabled={submitting}>
                  {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
                </Button>
              </div>
            </section>
          )}

          {error && step < 2 && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <aside className="h-fit space-y-4">
          <ClientCard size="full" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold tracking-wider text-cream/50 uppercase">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-cream/50">Subtotal</dt>
              <dd className="text-cream">{formatPrice(grandTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream/50">Shipping</dt>
              <dd className="text-cream">{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream/50">Tax</dt>
              <dd className="text-cream">{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
              <dt className="text-cream">Total</dt>
              <dd className="text-cream">{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-cream/40">Placed on Client Card {cardReady ? profile.number : ""}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutLine({ item }: { item: OrderLineItem }) {
  const code = item.seat
    ? admitCode(item.seat.concertId, item.seat.sectionId, item.seat.row, item.seat.seat)
    : null;
  return (
    <li className="flex gap-3">
      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-charcoal">
        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
      </div>
      <div className="min-w-0 flex-1">
        {code && <p className="font-mono text-[11px] text-gold">{code}</p>}
        <p className="text-sm font-medium text-cream">
          {code && item.name.startsWith(`${code} · `) ? item.name.slice(code.length + 3) : item.name}
        </p>
        <p className="text-xs text-cream/50">Qty {item.quantity}</p>
      </div>
      <p className="text-sm font-semibold text-cream">{formatPrice(item.unitPrice * item.quantity)}</p>
    </li>
  );
}
