"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Concert, MemberId, RollId } from "@/lib/types";
import {
  ROLL_META,
  admitCode,
  bestInSection,
  getSection,
  isSeatSold,
  nextAdjacent,
  openSeatCount,
  seatKey,
  seatSections,
  sectionsForRoll,
  type OpenSeat,
  type SeatSection,
} from "@/data/seating";
import { PRIVATE_ACCESS_MEMBERS, privateAccessOffers } from "@/data/private-access";
import { StadiumMap } from "@/components/tickets/stadium-map";
import { useCart } from "@/components/cart/cart-context";
import { useOrders } from "@/components/cart/order-context";
import { ProductGrid } from "@/components/catalog/product-grid";
import { getProductById } from "@/data/products";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STORE_PROMISE } from "@/lib/promise";

const ROLLS: RollId[] = ["front", "middle", "back"];
const MAX_SEATS = 8;
const STEPS = ["rolls", "seats", "access", "review"] as const;
const STEP_LABEL: Record<(typeof STEPS)[number], string> = {
  rolls: "Rolls",
  seats: "Seats",
  access: "Special access",
  review: "Review",
};
type Step = (typeof STEPS)[number];

const MERCH_IDS = ["lightstick-ver4", "arirang-tour-tee", "army-membership-kit", "incense-arirang"];

function holdKey(seat: OpenSeat) {
  return seatKey(seat.section.id, seat.row, seat.seat);
}

export function EventBoxOffice({ concert }: { concert: Concert }) {
  const { addSeat, items } = useCart();
  const { orders } = useOrders();
  const [step, setStep] = useState<Step>("rolls");
  const [marked, setMarked] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>("F1");
  const [held, setHeld] = useState<OpenSeat[]>([]);
  const [accessId, setAccessId] = useState<string | null>(null);
  const [accessSeatKey, setAccessSeatKey] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<MemberId | "">("");
  const [notice, setNotice] = useState<string | null>(null);

  const active = getSection(activeId) ?? seatSections[2];
  const access = privateAccessOffers.find((offer) => offer.id === accessId) ?? null;
  const markedSections = marked
    .map((id) => getSection(id))
    .filter((section): section is SeatSection => Boolean(section));

  const cartTaken = useMemo(() => {
    const keys = new Set<string>();
    const claim = (seat: { concertId: string; sectionId: string; row: number; seat: number } | undefined) => {
      if (seat?.concertId === concert.id) keys.add(seatKey(seat.sectionId, seat.row, seat.seat));
    };
    for (const item of items) claim(item.seat);
    for (const order of orders) {
      for (const item of order.items) claim(item.seat);
    }
    return keys;
  }, [items, orders, concert.id]);

  const heldKeys = useMemo(() => new Set(held.map(holdKey)), [held]);
  const blocked = useMemo(() => new Set([...cartTaken, ...heldKeys]), [cartTaken, heldKeys]);

  const accessKey =
    accessSeatKey && held.some((seat) => holdKey(seat) === accessSeatKey)
      ? accessSeatKey
      : held[0]
        ? holdKey(held[0])
        : null;
  const accessSeat = held.find((seat) => holdKey(seat) === accessKey) ?? null;

  const seatTotal = held.reduce((sum, seat) => sum + seat.section.price, 0);
  const accessTotal = access?.price ?? 0;
  const total = seatTotal + accessTotal;

  const cityMerch = MERCH_IDS.map((id) => getProductById(id)).filter(
    (product): product is NonNullable<typeof product> => Boolean(product)
  );

  function toggleMark(id: string) {
    setNotice(null);
    setActiveId(id);
    setMarked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function continueToSeats() {
    if (marked.length === 0) {
      setNotice("Mark at least one roll.");
      return;
    }
    if (!marked.includes(activeId)) setActiveId(marked[0]);
    setNotice(null);
    setStep("seats");
  }

  function toggleSeat(row: number, seat: number) {
    const key = seatKey(active.id, row, seat);
    if (isSeatSold(concert.id, active.id, row, seat) || cartTaken.has(key)) return;
    setNotice(null);
    setHeld((prev) => {
      const exists = prev.some((item) => holdKey(item) === key);
      if (exists) return prev.filter((item) => holdKey(item) !== key);
      if (prev.length >= MAX_SEATS) {
        setNotice(`You can hold up to ${MAX_SEATS} seats together.`);
        return prev;
      }
      return [...prev, { section: active, row, seat }];
    });
  }

  function takeBest() {
    const found = bestInSection(concert.id, active, blocked);
    if (!found) {
      setNotice(`No open seats left in ${active.label}.`);
      return;
    }
    if (held.length >= MAX_SEATS) {
      setNotice(`You can hold up to ${MAX_SEATS} seats together.`);
      return;
    }
    setNotice(null);
    setHeld((prev) => [...prev, found]);
  }

  function addNeighbor() {
    const found = nextAdjacent(concert.id, held, cartTaken);
    if (!found || !marked.includes(found.section.id)) {
      setNotice("No adjacent seat is open in the rolls you marked.");
      return;
    }
    if (held.length >= MAX_SEATS) {
      setNotice(`You can hold up to ${MAX_SEATS} seats together.`);
      return;
    }
    setNotice(null);
    setActiveId(found.section.id);
    setHeld((prev) => [...prev, found]);
  }

  function addToCart() {
    if (held.length === 0) {
      setNotice("Choose at least one seat.");
      return;
    }
    if (access?.requiresMember && !memberId) {
      setNotice("Choose a member for this private access.");
      return;
    }
    held.forEach((seat) => {
      addSeat({
        lineId: `${concert.id}:${seat.section.id}:${seat.row}:${seat.seat}`,
        concertId: concert.id,
        city: concert.city,
        country: concert.country,
        venue: concert.venue,
        date: concert.date,
        image: concert.image || "/concerts/arirang-hero.jpg",
        roll: seat.section.roll,
        rollLabel: ROLL_META[seat.section.roll].label,
        sectionId: seat.section.id,
        sectionLabel: seat.section.label,
        row: seat.row,
        seat: seat.seat,
        price: seat.section.price,
        privateAccess:
          access && holdKey(seat) === accessKey
            ? {
                id: access.id,
                title: access.title,
                price: access.price,
                memberId: access.requiresMember ? (memberId as MemberId) : undefined,
              }
            : undefined,
      });
    });
    setHeld([]);
    setNotice("Seats are in your cart.");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={concert.image || "/concerts/arirang-hero.jpg"}
            alt={`${concert.city} stadium`}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.25em] text-purple-glow uppercase">
              ARIRANG · {concert.status === "upcoming" ? "Upcoming" : "On sale"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-cream sm:text-4xl">{concert.city}</h1>
            <p className="mt-1 text-sm text-cream/70 sm:text-base">
              {formatDate(concert.date)} · {concert.venue}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-gold uppercase">Box office</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-cream">Choose where you sit</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/60">
            Mark one or more rolls, then pick seats in each. Front roll is the floor. Middle and
            back rolls wrap the floor. The stage is not a seat.
          </p>
          <ol className="mt-6 flex flex-wrap gap-2">
            {STEPS.map((id, index) => (
              <li
                key={id}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase",
                  step === id ? "bg-purple-main text-white" : "bg-white/5 text-cream/50"
                )}
              >
                {index + 1} {STEP_LABEL[id]}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-cream/45">
            {STORE_PROMISE}
          </p>
          <Link href="/box-office" className="mt-4 inline-block text-sm text-purple-glow hover:text-cream">
            All upcoming shows
          </Link>
        </div>
      </div>

      {(step === "rolls" || step === "seats") && (
        <div className="max-w-full overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-3 sm:p-4">
          <StadiumMap
            activeSectionId={activeId}
            selectedSectionIds={marked}
            onSelect={step === "rolls" ? toggleMark : (id) => marked.includes(id) && setActiveId(id)}
          />
        </div>
      )}

      {step === "rolls" && (
        <section className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {ROLLS.map((roll) => (
              <div key={roll}>
                <div className="mb-3 flex min-w-0 items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-cream">{ROLL_META[roll].label}</h3>
                    <p className="text-sm text-cream/45">{ROLL_META[roll].blurb}</p>
                  </div>
                  <p className="text-xs text-cream/40">
                    from {formatPrice(Math.min(...sectionsForRoll(roll).map((section) => section.price)))}
                  </p>
                </div>
                <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
                  {sectionsForRoll(roll).map((section) => {
                    const on = marked.includes(section.id);
                    const left = openSeatCount(concert.id, section, cartTaken);
                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => toggleMark(section.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
                            on ? "bg-purple-main/20" : "hover:bg-white/5"
                          )}
                        >
                          <span>
                            <span className="block text-sm font-semibold text-cream">{section.label}</span>
                            <span className="text-xs text-cream/45">{left} open</span>
                          </span>
                          <span className="text-sm font-semibold text-gold">{formatPrice(section.price)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-5 lg:sticky lg:top-24">
            <h3 className="font-display text-xl font-bold text-cream">Marked rolls</h3>
            {markedSections.length === 0 ? (
              <p className="mt-3 text-sm text-cream/50">Select every roll you want in this order.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-cream/80">
                {markedSections.map((section) => (
                  <li key={section.id}>
                    {ROLL_META[section.roll].label} · {section.label}
                  </li>
                ))}
              </ul>
            )}
            {notice && <p className="mt-3 text-sm text-gold">{notice}</p>}
            <Button className="mt-5 w-full" disabled={marked.length === 0} onClick={continueToSeats}>
              Continue to seats
            </Button>
          </aside>
        </section>
      )}

      {step === "seats" && (
        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            {markedSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveId(section.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium",
                  active.id === section.id ? "bg-purple-main text-white" : "bg-white/5 text-cream/70"
                )}
              >
                {section.label}
                <span className="ml-2 text-xs opacity-70">{formatPrice(section.price)}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl glass p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-widest text-purple-glow uppercase">
                  {ROLL_META[active.roll].label}
                </p>
                <h3 className="font-display text-2xl font-bold text-cream">
                  {active.label}
                  <span className="ml-3 text-lg text-gold">{formatPrice(active.price)}</span>
                </h3>
                <p className="mt-1 text-sm text-cream/50">Row 1 is closest to the stage.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={takeBest}>
                  Best in this section
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={addNeighbor} disabled={held.length === 0}>
                  Add adjacent
                </Button>
              </div>
            </div>
            <div className="scroll-row mt-5 max-w-full">
              <div className="min-w-max space-y-1.5">
                {Array.from({ length: active.rows }, (_, index) => {
                  const row = index + 1;
                  return (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-[10px] tracking-wide text-cream/40 uppercase">
                        Row {row}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: active.seatsPerRow }, (_, seatIndex) => {
                          const seat = seatIndex + 1;
                          const key = seatKey(active.id, row, seat);
                          const sold = isSeatSold(concert.id, active.id, row, seat) || cartTaken.has(key);
                          const selected = heldKeys.has(key);
                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={sold}
                              onClick={() => toggleSeat(row, seat)}
                              title={admitCode(concert.id, active.id, row, seat)}
                              aria-label={`${admitCode(concert.id, active.id, row, seat)}${sold ? " sold" : ""}`}
                              className={cn(
                                "h-7 w-7 rounded-md text-[10px] font-semibold",
                                sold && "cursor-not-allowed bg-white/5 text-cream/20",
                                !sold && !selected && "bg-white/10 text-cream/80 hover:bg-purple-main/50",
                                selected && "bg-purple-main text-white"
                              )}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <HoldSummary concertId={concert.id} held={held} />
          {notice && <p className="mt-3 text-sm text-gold">{notice}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep("rolls")}>
              Add another roll
            </Button>
            <Button disabled={held.length === 0} onClick={() => setStep("access")}>
              Special access
            </Button>
          </div>
        </section>
      )}

      {step === "access" && (
        <section className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 rounded-3xl glass p-4 sm:p-5">
            <h3 className="font-display text-2xl font-bold text-cream">Special access</h3>
            <p className="mt-2 text-sm text-cream/55">
              Add one extra for this hold. It is priced once and stays on the seat you mark. Skip it if you only need the seats.
            </p>
            <div className="mt-5 space-y-2">
              {privateAccessOffers.map((offer) => {
                const on = accessId === offer.id;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => {
                      setAccessId(on ? null : offer.id);
                      setNotice(null);
                    }}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left",
                      on ? "border-gold/60 bg-gold/10" : "border-white/10 hover:border-white/25"
                    )}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-medium text-cream">
                      {offer.title}
                      <span className="text-gold">{formatPrice(offer.price)}</span>
                    </span>
                    <span className="mt-1 block text-xs text-cream/50">{offer.description}</span>
                  </button>
                );
              })}
            </div>
            {access?.requiresMember && (
              <label className="mt-4 block text-sm text-cream/70">
                Member
                <select
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value as MemberId)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                >
                  <option value="">Choose a member</option>
                  {PRIVATE_ACCESS_MEMBERS.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setStep("seats")}>
                Back to seats
              </Button>
              <Button onClick={() => setStep("review")}>Review tickets</Button>
            </div>
          </div>
          <HoldSummary concertId={concert.id} held={held} />
        </section>
      )}

      {step === "review" && (
        <section className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 rounded-3xl glass p-4 sm:p-5">
            <h3 className="font-display text-2xl font-bold text-cream">Your tickets</h3>
            <p className="mt-1 text-sm text-cream/45">
              Each row is one admit code. Special access stays on the seat you mark.
            </p>
            <ul className="mt-4 space-y-3 md:hidden">
              {held.map((seat) => {
                const key = holdKey(seat);
                const code = admitCode(concert.id, seat.section.id, seat.row, seat.seat);
                const selected = key === accessKey;
                return (
                  <li key={key} className="rounded-2xl border border-white/10 p-3">
                    <p className="break-all font-mono text-[11px] text-gold">{code}</p>
                    <p className="mt-2 text-sm text-cream">
                      {ROLL_META[seat.section.roll].label} · {seat.section.id} {seat.section.label}
                    </p>
                    <p className="text-xs text-cream/50">
                      Row {seat.row} · Seat {seat.seat}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-semibold text-cream">{formatPrice(seat.section.price)}</span>
                      <button
                        type="button"
                        onClick={() => setAccessSeatKey(key)}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-semibold",
                          selected ? "bg-purple-main text-white" : "bg-white/10 text-cream/70"
                        )}
                      >
                        {selected ? "Access on this seat" : "Put access here"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="scroll-row mt-4 hidden max-w-full md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-[10px] tracking-widest text-cream/40 uppercase">
                  <tr>
                    <th className="pb-2 font-semibold">Admit code</th>
                    <th className="pb-2 font-semibold">Roll</th>
                    <th className="pb-2 font-semibold">Section</th>
                    <th className="pb-2 font-semibold">Row</th>
                    <th className="pb-2 font-semibold">Seat</th>
                    <th className="pb-2 font-semibold">Price</th>
                    <th className="pb-2 font-semibold">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {held.map((seat) => {
                    const key = holdKey(seat);
                    const code = admitCode(concert.id, seat.section.id, seat.row, seat.seat);
                    return (
                      <tr key={key} className="border-t border-white/10">
                        <td className="py-2 font-mono text-xs text-cream">{code}</td>
                        <td className="py-2 text-cream/70">{ROLL_META[seat.section.roll].label}</td>
                        <td className="py-2 text-cream/70">
                          {seat.section.id} {seat.section.label}
                        </td>
                        <td className="py-2 text-cream/70">{seat.row}</td>
                        <td className="py-2 text-cream/70">{seat.seat}</td>
                        <td className="py-2 font-semibold text-cream">{formatPrice(seat.section.price)}</td>
                        <td className="py-2">
                          <label className="inline-flex items-center gap-2 text-xs text-cream/70">
                            <input
                              type="radio"
                              name="access-seat"
                              checked={key === accessKey}
                              onChange={() => setAccessSeatKey(key)}
                            />
                            This seat
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Button className="mt-6" variant="outline" onClick={() => setStep("access")}>
              Special access
            </Button>
          </div>
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">Special access</p>
            {accessSeat && (
              <p className="mt-2 break-all font-mono text-[11px] text-cream/70">
                {admitCode(concert.id, accessSeat.section.id, accessSeat.row, accessSeat.seat)}
              </p>
            )}
            <div className="mt-3 space-y-2">
              {privateAccessOffers.map((offer) => {
                const on = accessId === offer.id;
                return (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => {
                      setAccessId(on ? null : offer.id);
                      setNotice(null);
                    }}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left",
                      on ? "border-gold/60 bg-gold/10" : "border-white/10 hover:border-white/25"
                    )}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm text-cream">
                      {offer.title}
                      <span className="text-gold">{formatPrice(offer.price)}</span>
                    </span>
                    <span className="mt-1 block text-xs text-cream/45">{offer.description}</span>
                  </button>
                );
              })}
            </div>
            {access?.requiresMember && (
              <label className="mt-3 block text-xs text-cream/50">
                Member
                <select
                  value={memberId}
                  onChange={(event) => setMemberId(event.target.value as MemberId)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal px-3 py-2 text-sm text-cream"
                >
                  <option value="">Choose a member</option>
                  {PRIVATE_ACCESS_MEMBERS.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <dl className="mt-5 space-y-1 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-cream/60">
                <dt>Seats</dt>
                <dd>{formatPrice(seatTotal)}</dd>
              </div>
              <div className="flex justify-between text-cream/60">
                <dt>Special access</dt>
                <dd>{formatPrice(accessTotal)}</dd>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-cream">
                <dt>Hold total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            {notice && <p className="mt-3 text-sm text-gold">{notice}</p>}
            <Button className="mt-4 w-full" onClick={addToCart} disabled={held.length === 0}>
              Add to cart
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/40">
              {STORE_PROMISE}
            </p>
          </aside>
        </section>
      )}

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-cream">Wear the show</h2>
        <p className="mt-1 mb-8 text-sm text-cream/50">
          Light stick, city pieces, and the membership kit that upgrades your Client Card.
        </p>
        <ProductGrid products={cityMerch} />
      </section>
    </div>
  );
}

function HoldSummary({ concertId, held }: { concertId: string; held: OpenSeat[] }) {
  if (held.length === 0) return null;
  return (
    <ul className="mt-4 space-y-1 text-sm text-cream/70">
      {held.map((seat) => (
        <li key={holdKey(seat)}>
          <span className="font-mono text-xs text-cream">
            {admitCode(concertId, seat.section.id, seat.row, seat.seat)}
          </span>
          {" · "}
          {ROLL_META[seat.section.roll].label} · {seat.section.id} {seat.section.label} · Row {seat.row} · Seat{" "}
          {seat.seat} · {formatPrice(seat.section.price)}
        </li>
      ))}
    </ul>
  );
}
