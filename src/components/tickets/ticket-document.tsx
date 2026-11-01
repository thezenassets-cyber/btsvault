"use client";

import Link from "next/link";
import { useClientCard } from "@/components/client-card/client-card-context";
import { useOrders } from "@/components/cart/order-context";
import { StadiumMap } from "@/components/tickets/stadium-map";
import { admitCode } from "@/data/seating";
import { STORE_PROMISE } from "@/lib/promise";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Order, TicketStub } from "@/lib/types";

function bars(value: string) {
  const widths: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    widths.push(1 + (code % 3));
    widths.push(code % 2 === 0 ? 2 : 1);
  }
  return widths;
}

function stubFromOrders(id: string, orders: Order[], cardNumber: string): TicketStub | null {
  for (const order of orders) {
    for (const item of order.items) {
      if (!item.seat) continue;
      const stubId = `${order.id}:${item.seat.lineId}`;
      if (stubId !== id) continue;
      return {
        id: stubId,
        orderId: order.id,
        concertId: item.seat.concertId,
        city: item.seat.city,
        venue: item.seat.venue,
        date: item.seat.date,
        image: item.seat.image,
        rollLabel: item.seat.rollLabel,
        sectionId: item.seat.sectionId,
        sectionLabel: item.seat.sectionLabel,
        row: item.seat.row,
        seat: item.seat.seat,
        price: item.unitPrice,
        privateAccessTitle: item.seat.privateAccess?.title,
        memberId: item.seat.privateAccess?.memberId,
        clientCardNumber: order.clientCardNumber || cardNumber,
      };
    }
  }
  return null;
}

export function TicketDocument({ stubId }: { stubId: string }) {
  const { stubs, profile, ready: cardReady } = useClientCard();
  const { orders, ready: ordersReady } = useOrders();
  const stub = stubs.find((item) => item.id === stubId) ?? stubFromOrders(stubId, orders, profile.number);

  if (!cardReady || !ordersReady) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-cream/50">Opening your ticket…</div>
    );
  }

  if (!stub) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-cream">Ticket not on this card</h1>
        <p className="mt-2 text-cream/50">Check out a seat first, then open it from My Vault.</p>
        <Link href="/vault" className="mt-6 inline-block">
          <Button>My Vault</Button>
        </Link>
      </div>
    );
  }

  const pattern = bars(stub.id);
  const code = stub.sectionId
    ? admitCode(stub.concertId, stub.sectionId, stub.row, stub.seat)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/vault" className="text-sm text-purple-glow hover:text-cream">
          Back to My Vault
        </Link>
        <Button type="button" onClick={() => window.print()}>
          Download ticket
        </Button>
      </div>

      <article className="ticket-sheet overflow-hidden rounded-3xl border border-gold/40 bg-[#120c18] text-cream shadow-2xl print:rounded-none print:border-0 print:text-black">
        <div className="grid xl:grid-cols-[1.5fr_0.7fr]">
          <div className="min-w-0 p-5 sm:p-10">
            <p className="text-[11px] font-semibold tracking-[0.35em] text-gold uppercase">
              ARIRANG World Tour
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-cream print:text-black sm:text-5xl">
              {stub.city}
            </h1>
            <p className="mt-2 text-lg text-cream/70 print:text-black/70">
              {formatDate(stub.date)} · {stub.venue}
            </p>
            {code && (
              <p className="mt-4 break-all font-mono text-sm tracking-wide text-gold print:text-black">{code}</p>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Roll", stub.rollLabel],
                ["Section", stub.sectionId ? `${stub.sectionId} ${stub.sectionLabel}` : stub.sectionLabel],
                ["Row", String(stub.row)],
                ["Seat", String(stub.seat)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 print:border-black/15 print:bg-transparent">
                  <dt className="text-[10px] tracking-widest text-cream/40 uppercase print:text-black/50">{label}</dt>
                  <dd className="mt-1 font-display text-lg font-bold">{value}</dd>
                </div>
              ))}
            </dl>

            {stub.privateAccessTitle && (
              <p className="mt-4 text-sm text-gold print:text-black">
                {stub.privateAccessTitle}
                {stub.memberId ? ` · ${stub.memberId.toUpperCase()}` : ""}
              </p>
            )}

            <div className="mt-6 max-w-full overflow-hidden rounded-2xl bg-black/40 p-3 print:bg-transparent sm:max-w-md">
              <StadiumMap interactive={false} highlightSectionId={stub.sectionId ?? null} />
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-cream/40 print:text-black/50">
              Admit one. {STORE_PROMISE} Vault list price {formatPrice(stub.price)}.
            </p>
          </div>

          <aside className="flex min-w-0 flex-col justify-between border-t border-dashed border-gold/50 bg-black/30 p-5 sm:p-8 xl:border-t-0 xl:border-l print:border-black/30 print:bg-transparent">
            <div>
              <p className="text-[11px] tracking-[0.4em] text-gold uppercase print:text-black">Admit one</p>
              <p className="mt-4 font-display text-3xl font-bold">{stub.city}</p>
              {code && (
                <p className="mt-3 break-all font-mono text-[11px] tracking-wide text-gold print:text-black">{code}</p>
              )}
              <p className="mt-1 text-sm text-cream/60 print:text-black/60">
                {stub.sectionId ? `${stub.sectionId} ` : ""}
                {stub.sectionLabel} · Row {stub.row} · Seat {stub.seat}
              </p>
              <p className="mt-4 font-mono text-xs tracking-wider text-cream/50 print:text-black/60">
                {stub.clientCardNumber}
              </p>
            </div>
            <div className="mt-8">
              <div className="flex h-16 items-end gap-px" aria-hidden>
                {pattern.map((width, index) => (
                  <span
                    key={`${stub.id}-${index}`}
                    className="bg-cream print:bg-black"
                    style={{ width, height: index % 4 === 0 ? "100%" : "72%" }}
                  />
                ))}
              </div>
              <p className="mt-2 break-all font-mono text-[10px] tracking-widest text-cream/40 print:text-black/50">
                {stub.id}
              </p>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
