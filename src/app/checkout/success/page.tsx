"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useOrders } from "@/components/cart/order-context";
import { useClientCard } from "@/components/client-card/client-card-context";
import { ClientCard } from "@/components/client-card/client-card";
import { admitCode } from "@/data/seating";
import { formatPrice } from "@/lib/utils";
import { bookingItinerary } from "@/lib/booking/itinerary";
import { openPaymentChat, paymentChatMessage, readPaymentChat, type PaymentChatPayload } from "@/lib/support/tawk-checkout";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";
import { useI18n } from "@/lib/i18n/provider";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const { clearCart } = useCart();
  const { getOrder, lastOrder, ready } = useOrders();
  const { recordOrderTickets, profile, ready: cardReady } = useClientCard();
  const { t } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [chat, setChat] = useState<PaymentChatPayload | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ready || !cardReady) return;
    const found = orderId ? getOrder(orderId) ?? lastOrder : lastOrder;
    const next =
      found && found.clientCardNumber && found.clientCardNumber !== profile.number ? null : found;
    setOrder(next ?? null);
    if (next && next.status !== "pending") recordOrderTickets(next);
    setChat(readPaymentChat());
    const sandbox = Boolean(next && next.payment.brand.startsWith("PaymentWings"));
    if (sandbox) clearCart();
    if (next && next.status === "pending" && !sandbox) {
      const stored = readPaymentChat();
      void openPaymentChat(
        stored && stored.orderId === next.id
          ? stored
          : {
              orderId: next.id,
              name: next.shipping.fullName,
              email: next.shipping.email,
              total: formatPrice(next.total),
              itinerary: bookingItinerary(next.items),
              items: next.items.map((item) => `${item.quantity} × ${item.name}`).join("\n"),
            }
      );
    }
  }, [ready, cardReady, orderId, getOrder, lastOrder, recordOrderTickets, profile.number, clearCart]);

  if (!ready || !cardReady) {
    return <div className="px-4 py-24 text-center text-cream/50">{t("ok.loading")}</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-cream">{t("ok.order")}</h1>
        <p className="mt-2 text-cream/50">{t("ok.missing")}</p>
        <Link href="/explore" className="mt-6 inline-block">
          <Button>{t("ok.keep")}</Button>
        </Link>
      </div>
    );
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const sandbox = order.payment.brand.startsWith("PaymentWings");
  const waitingOnChat = order.status === "pending" && !sandbox;
  const itinerary =
    chat && chat.orderId === order.id && chat.itinerary ? chat.itinerary : bookingItinerary(order.items);
  const note =
    chat && chat.orderId === order.id
      ? paymentChatMessage(chat)
      : `ARMY Vault payment\nOrder ${order.id}\nTotal ${formatPrice(order.total)}${itinerary ? `\n${itinerary}` : ""}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-400" />
      <h1 className="mt-4 text-3xl font-bold text-cream">
        {sandbox ? t("ok.sandboxTitle") : waitingOnChat ? t("ok.booked") : t("ok.in")}
      </h1>
      <p className="mt-2 text-cream/60">
        Order <span className="font-mono text-purple-glow">{order.id}</span>
        {sandbox ? `. ${t("ok.sandboxBody")}` : waitingOnChat ? ` ${t("ok.held")}` : ` ${t("ok.onCard")}`}
      </p>
      {sandbox && itinerary && (
        <ul className="mx-auto mt-6 max-w-sm space-y-1 text-left text-sm text-cream/75">
          {itinerary.split("\n").map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
        </ul>
      )}
      {waitingOnChat && (
        <div className="mt-6">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() =>
                openPaymentChat(
                  chat && chat.orderId === order.id
                    ? chat
                    : {
                        orderId: order.id,
                        name: order.shipping.fullName,
                        email: order.shipping.email,
                        total: formatPrice(order.total),
                        itinerary: bookingItinerary(order.items),
                        items: order.items.map((item) => `${item.quantity} × ${item.name}`).join("\n"),
                      }
                )
              }
            >
              {t("ok.message")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(note).then(() => setCopied(true));
              }}
            >
              {copied ? t("ok.copied") : t("ok.copy")}
            </Button>
          </div>
          {itinerary && (
            <ul className="mx-auto mt-6 max-w-sm space-y-1 text-left text-sm text-cream/75">
              {itinerary.split("\n").map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="mt-4 text-2xl font-bold text-cream">{formatPrice(order.total)}</p>
      <p className="mt-1 text-sm text-cream/40">
        {itemCount} {itemCount === 1 ? t("ok.item") : t("ok.items")} ·{" "}
        {order.clientCardNumber || profile.number}
      </p>
      <div className="mx-auto mt-8 max-w-sm text-left">
        <ClientCard size="full" />
      </div>
      {order.items.some((item) => item.seat) && (
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-cream/70">
          {order.items
            .filter((item) => item.seat)
            .map((item) => {
              const code = item.seat
                ? admitCode(item.seat.concertId, item.seat.sectionId, item.seat.row, item.seat.seat)
                : null;
              const prefix = code ? `${code} · ` : "";
              const words = prefix && item.name.startsWith(prefix) ? item.name.slice(prefix.length) : item.name;
              return (
              <li key={item.lineId ?? item.name} className="rounded-xl border border-white/10 px-4 py-3">
                {code && <p className="font-mono text-[11px] text-gold">{code}</p>}
                <p>{words}</p>
                {item.seat && !waitingOnChat && (
                  <Link
                    href={`/tickets/${encodeURIComponent(`${order.id}:${item.seat.lineId}`)}`}
                    className="mt-2 inline-block text-xs font-semibold text-purple-glow hover:text-cream"
                  >
                    Download ticket
                  </Link>
                )}
              </li>
              );
            })}
        </ul>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/vault">
          <Button>{t("ok.view")}</Button>
        </Link>
        <Link href="/box-office">
          <Button variant="secondary">{t("ok.more")}</Button>
        </Link>
        <Link href="/members">
          <Button variant="outline">{t("ok.shop")}</Button>
        </Link>
      </div>
      <p className="mt-6 text-sm text-cream/45">
        Flood the timeline — invite a friend so they can build their member set too.
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-cream/50">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
