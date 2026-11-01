"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useOrders } from "@/components/cart/order-context";
import { ROLL_META, admitCode, getSection } from "@/data/seating";
import { formatDate, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function AdminBoxOfficePage() {
  const { orders, ready } = useOrders();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const list = orders.flatMap((order) =>
      order.items.flatMap((item) => {
        if (!item.seat) return [];
        const seat = item.seat;
        const section = getSection(seat.sectionId);
        const access = seat.privateAccess;
        return [
          {
            admit: admitCode(seat.concertId, seat.sectionId, seat.row, seat.seat),
            show: `${seat.city} · ${formatDate(seat.date)}`,
            date: seat.date,
            concertId: seat.concertId,
            roll: seat.rollLabel || (section ? ROLL_META[section.roll].label : seat.roll),
            sectionId: seat.sectionId,
            label: seat.sectionLabel,
            row: seat.row,
            seat: seat.seat,
            card: order.clientCardNumber || "—",
            orderId: order.id,
            access: access
              ? access.memberId
                ? `${access.title} · ${access.memberId.toUpperCase()}`
                : access.title
              : "—",
            price: item.unitPrice,
            slot: section?.slot ?? 99,
          },
        ];
      })
    );
    list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.concertId !== b.concertId) return a.concertId.localeCompare(b.concertId);
      if (a.slot !== b.slot) return a.slot - b.slot;
      if (a.row !== b.row) return a.row - b.row;
      return a.seat - b.seat;
    });
    return list;
  }, [orders]);

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? rows.filter(
        (row) =>
          row.admit.toLowerCase().includes(needle) ||
          row.card.toLowerCase().includes(needle) ||
          row.orderId.toLowerCase().includes(needle)
      )
    : rows;

  return (
    <AdminShell title="Box office">
      <p className="max-w-2xl text-sm text-cream/50">
        One row per seat. The admit code is the seat, so Front Outer on the left never sits in the
        same place as Front Outer on the right. Paid demo orders stay in this browser.
      </p>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search admit code, Client Card, or order"
        className="mt-4 max-w-md"
      />
      {!ready && <p className="mt-8 text-sm text-cream/50">Loading the ledger…</p>}
      {ready && rows.length === 0 && (
        <p className="mt-8 text-sm text-cream/50">
          No seats in this browser yet. A paid demo order on this device will appear here.
        </p>
      )}
      {ready && rows.length > 0 && visible.length === 0 && (
        <p className="mt-8 text-sm text-cream/50">No seats match that search.</p>
      )}
      {ready && visible.length > 0 && (
        <div className="scroll-row mt-6 rounded-2xl border border-white/10">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] tracking-widest text-cream/40 uppercase">
              <tr>
                {[
                  "Admit code",
                  "Show",
                  "Roll",
                  "Section",
                  "Label",
                  "Row",
                  "Seat",
                  "Client Card",
                  "Order",
                  "Private access",
                  "Price",
                ].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={`${row.orderId}-${row.admit}`} className="border-t border-white/10">
                  <td className="px-3 py-3 font-mono text-xs text-gold">{row.admit}</td>
                  <td className="px-3 py-3 text-cream/80">{row.show}</td>
                  <td className="px-3 py-3 text-cream/70">{row.roll}</td>
                  <td className="px-3 py-3 font-mono text-xs text-cream">{row.sectionId}</td>
                  <td className="px-3 py-3 text-cream/70">{row.label}</td>
                  <td className="px-3 py-3 text-cream/70">{row.row}</td>
                  <td className="px-3 py-3 text-cream/70">{row.seat}</td>
                  <td className="px-3 py-3 font-mono text-xs text-cream/70">{row.card}</td>
                  <td className="px-3 py-3 font-mono text-xs text-cream/70">{row.orderId}</td>
                  <td className="px-3 py-3 text-cream/70">{row.access}</td>
                  <td className="px-3 py-3 font-semibold text-cream">{formatPrice(row.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
