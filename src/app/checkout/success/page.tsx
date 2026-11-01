"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useOrders } from "@/components/cart/order-context";
import { useClientCard } from "@/components/client-card/client-card-context";
import { ClientCard } from "@/components/client-card/client-card";
import { admitCode } from "@/data/seating";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";

function SuccessInner() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const { getOrder, lastOrder, ready } = useOrders();
  const { recordOrderTickets, profile } = useClientCard();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!ready) return;
    const next = orderId ? getOrder(orderId) ?? lastOrder : lastOrder;
    setOrder(next);
    if (next) recordOrderTickets(next);
  }, [ready, orderId, getOrder, lastOrder, recordOrderTickets]);

  if (!ready) {
    return <div className="px-4 py-24 text-center text-cream/50">Loading your order…</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-cream">Order confirmed</h1>
        <p className="mt-2 text-cream/50">This order is not on this Client Card.</p>
        <Link href="/explore" className="mt-6 inline-block">
          <Button>Keep shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-400" />
      <h1 className="mt-4 text-3xl font-bold text-cream">You&apos;re in, ARMY</h1>
      <p className="mt-2 text-cream/60">
        Order <span className="font-mono text-purple-glow">{order.id}</span> is on your Client Card.
      </p>
      <p className="mt-4 text-2xl font-bold text-cream">{formatPrice(order.total)}</p>
      <p className="mt-1 text-sm text-cream/40">
        {order.items.length} items · Client Card {order.clientCardNumber || profile.number}
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
                {item.seat && (
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
          <Button>View card and stubs</Button>
        </Link>
        <Link href="/box-office">
          <Button variant="secondary">More seats</Button>
        </Link>
        <Link href="/members">
          <Button variant="outline">Shop more members</Button>
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
