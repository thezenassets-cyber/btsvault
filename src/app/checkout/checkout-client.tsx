"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
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
import { CatalogPhoto } from "@/components/catalog/catalog-photo";
import { resolveProductPhoto } from "@/lib/product-images";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";

function placeLabel(city: string, date: string) {
  const when = formatDate(date);
  return when ? `${city} · ${when}` : city;
}

export function CheckoutClient() {
  const { items, ready, grandTotal } = useCart();
  const { saveOrder } = useOrders();
  const { profile, ready: cardReady } = useClientCard();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (!cardReady || seeded) return;
    setName(profile.holderName);
    setSeeded(true);
  }, [cardReady, profile.holderName, seeded]);

  useEffect(() => {
    setCanceled(new URLSearchParams(window.location.search).get("canceled") === "1");
  }, []);

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
          if (item.stay) {
            return {
              productId: item.productId,
              name: item.stay.title,
              quantity: 1,
              unitPrice: item.stay.price,
              image: item.stay.image,
              lineId: item.stay.lineId,
              stay: item.stay,
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
      if (item.stay) {
        const key = item.stay.concertId;
        const group = shows.get(key) ?? {
          label: placeLabel(item.stay.city, item.stay.date),
          items: [],
        };
        group.items.push(item);
        shows.set(key, group);
        continue;
      }
      if (!item.seat) {
        merch.push(item);
        continue;
      }
      const key = item.seat.concertId;
      const group = shows.get(key) ?? {
        label: placeLabel(item.seat.city, item.seat.date),
        items: [],
      };
      group.items.push(item);
      shows.set(key, group);
    }
    return { shows: [...shows.values()], merch };
  }, [lineItems]);

  const shipping: ShippingAddress = {
    fullName: name || profile.holderName,
    email,
    phone,
    line1: profile.number,
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  };
  const { total } = quoteTotals(lineItems, shipping.country, grandTotal, { desk: true });

  const paymentPreview: PaymentDetails = {
    cardholderName: shipping.fullName,
    last4: profile.number.replace(/\D/g, "").slice(-4),
    brand: "PaymentWings",
  };

  async function placeOrder() {
      if (!email.includes("@")) {
      setError("Add the email for this checkout.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const data = await submitCheckout({
        shipping,
        payment: paymentPreview,
        items: lineItems.map((item) => {
          if (item.seat) return item;
          const product = getProductById(item.productId);
          if (!product) return item;
          return { ...item, image: resolveProductPhoto(product.slug, product.image) };
        }),
        subtotal: grandTotal,
        currency: "USD",
        clientCardNumber: profile.number,
        channel: "paymentwings",
      });
      if ("error" in data) throw new Error(data.error);
      const response = await fetch("/api/payments/paymentwings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: data.order.total,
          currency: "USD",
          email,
          orderId: data.orderId,
          origin: window.location.origin,
        }),
      });
      const session = (await response.json()) as { url?: string; transactionId?: string; error?: string };
      if (!response.ok || !session.url || !session.transactionId) {
        throw new Error(session.error || "PaymentWings could not start checkout");
      }
      saveOrder({
        ...data.order,
        payment: { ...data.order.payment, transactionId: session.transactionId },
      });
      window.location.assign(session.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return <div className="px-4 py-24 text-center text-cream/50">{t("out.loading")}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-cream/30" />
        <h1 className="text-2xl font-bold text-cream">{t("out.emptyTitle")}</h1>
        <p className="mt-2 text-cream/50">{t("out.empty")}</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>{t("out.floor")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-cream">{t("out.checkout")}</h1>
      <p className="mt-1 text-sm text-cream/50">{t("out.lead")}</p>

      <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl glass p-6">
            <h2 className="mb-4 text-lg font-semibold text-cream">{t("out.onCard")}</h2>
            <div className="space-y-6">
              {checkoutGroups.shows.map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-xs font-semibold tracking-widest text-gold uppercase">{group.label}</p>
                  <ul className="space-y-4">
                    {group.items.map((item) => (
                      <CheckoutLine key={item.lineId ?? item.name} item={item} />
                    ))}
                  </ul>
                </div>
              ))}
              {checkoutGroups.merch.length > 0 && (
                <ul className="space-y-4">
                  {checkoutGroups.merch.map((item) => (
                    <CheckoutLine
                      key={item.lineId ?? `${item.productId}-${item.selectedSize ?? ""}`}
                      item={item}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4">
          <ClientCard size="full" />
          <div className="rounded-2xl border border-gold/30 bg-white/5 p-6">
            <h2 className="text-sm font-semibold tracking-wider text-gold uppercase">{t("out.details")}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-xs text-cream/50">
                {t("out.name")}
                <Input className="mt-1" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="block text-xs text-cream/50">
                {t("out.email")}
                <Input
                  className="mt-1"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="block text-xs text-cream/50">
                {t("out.phone")}
                <Input className="mt-1" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
                <dt className="text-cream">{t("out.onCard")}</dt>
                <dd className="text-cream">{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-cream/45">{t("out.ship")}</p>
            {canceled && <p className="mt-4 text-sm text-cream/70">{t("out.canceled")}</p>}
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            <Button className="mt-5 w-full" onClick={placeOrder} disabled={submitting}>
              {submitting ? t("out.confirming") : `${t("out.continue")} · ${formatPrice(total)}`}
            </Button>
            <p className="mt-3 text-xs text-cream/40">
              {cardReady ? profile.number : ""}. {t("out.sandbox")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckoutLine({ item }: { item: OrderLineItem }) {
  const { t } = useI18n();
  const code = item.seat
    ? admitCode(item.seat.concertId, item.seat.sectionId, item.seat.row, item.seat.seat)
    : null;
  return (
    <li className="flex gap-3">
      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-charcoal">
        <CatalogPhoto
          slug={item.seat ? undefined : getProductById(item.productId)?.slug}
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        {code && <p className="font-mono text-[11px] text-gold">{code}</p>}
        <p className="text-sm font-medium text-cream">
          {code && item.name.startsWith(`${code} · `) ? item.name.slice(code.length + 3) : item.name}
        </p>
        <p className="text-xs text-cream/50">{t("out.qty")} {item.quantity}</p>
        {item.stay?.includes && item.stay.includes.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cream/55">
            {item.stay.includes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-sm font-semibold text-cream">{formatPrice(item.unitPrice * item.quantity)}</p>
    </li>
  );
}
