"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { bookLanes } from "@/components/vault/book-shortcuts";
import {
  STAY_RATES,
  gaListPrice,
  isBookingLane,
  meetGroupOffer,
  meetMemberOffer,
  stayRate,
  vipListPrice,
  type BookingLane,
  type StayNights,
} from "@/data/booking";
import { getSellableConcerts } from "@/data/concerts";
import { hotelsForCity } from "@/data/hotels";
import { shopMembers } from "@/data/members";
import { buildCityStay, buildCustomHold, buildHeldSeat } from "@/lib/booking/holds";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShopMemberId } from "@/lib/types";

export function BookDesk() {
  const params = useSearchParams();
  const router = useRouter();
  const { addSeat, addStay } = useCart();
  const requested = params.get("lane");
  const lane: BookingLane = isBookingLane(requested) ? requested : "meet";
  const nights = getSellableConcerts();
  const cities = useMemo(() => {
    const grouped = new Map<string, typeof nights>();
    for (const night of nights) {
      const list = grouped.get(night.city) ?? [];
      list.push(night);
      grouped.set(night.city, list);
    }
    return [...grouped.entries()];
  }, [nights]);

  const [ownCity, setOwnCity] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [city, setCity] = useState(cities[0]?.[0] ?? "");
  const [concertId, setConcertId] = useState(cities[0]?.[1][0]?.id ?? "");
  const [hotelId, setHotelId] = useState("");
  const [customHotel, setCustomHotel] = useState("");
  const [memberId, setMemberId] = useState<ShopMemberId | "">("");
  const [access, setAccess] = useState<"member" | "ot7">("member");
  const [tier, setTier] = useState<"ga" | "vip">("ga");
  const [party, setParty] = useState(2);
  const [stayNights, setStayNights] = useState<StayNights>(3);
  const [meetAddOn, setMeetAddOn] = useState(false);

  const cityNights = cities.find(([name]) => name === city)?.[1] ?? [];
  const concert = cityNights.find((night) => night.id === concertId) ?? cityNights[0];
  const hotels = ownCity ? [] : hotelsForCity(city);
  const one = meetMemberOffer();
  const group = meetGroupOffer();
  const ga = gaListPrice();
  const vip = vipListPrice();
  const stay = stayRate(stayNights);
  const place = ownCity ? customCity.trim() : city;
  const hotel = (hotelId === "custom" ? customHotel : hotels.find((item) => item.id === hotelId)?.name || "").trim();

  useEffect(() => {
    if (!cityNights.some((night) => night.id === concertId)) {
      setConcertId(cityNights[0]?.id ?? "");
    }
  }, [city, cityNights, concertId]);

  const quote = useMemo(() => {
    if (!one || !group || !place) return [];
    if (ownCity) {
      if (lane === "meet") {
        const chosen = access === "ot7" ? group : one;
        return [{ label: chosen.title, price: chosen.price }];
      }
      if (lane === "reserve") {
        const each = tier === "vip" ? vip : ga;
        return [{ label: `${party} × ${tier === "vip" ? "VIP" : "GA"}`, price: each * party }];
      }
      const lines: { label: string; price: number }[] = [{ label: `${stay.nights} nights`, price: stay.price }];
      if (meetAddOn) lines.push({ label: one.title, price: one.price });
      return lines;
    }
    if (!concert) return [];
    if (lane === "meet") {
      const chosen = access === "ot7" ? group : one;
      return [
        { label: `VIP seat · ${concert.city}`, price: vip },
        { label: chosen.title, price: chosen.price },
      ];
    }
    if (lane === "reserve") {
      const each = tier === "vip" ? vip : ga;
      return [{ label: `${party} × ${tier === "vip" ? "VIP" : "GA"} · ${concert.city}`, price: each * party }];
    }
    const lines: { label: string; price: number }[] = [
      { label: `GA seat · ${concert.city}`, price: ga },
      { label: `${stay.nights} nights`, price: stay.price },
    ];
    if (meetAddOn) lines.push({ label: one.title, price: one.price });
    return lines;
  }, [access, concert, ga, group, lane, meetAddOn, one, ownCity, party, place, stay.nights, stay.price, tier, vip]);

  const total = quote.reduce((sum, line) => sum + line.price, 0);
  const ready =
    Boolean(place && hotel && one && group) &&
    (ownCity || Boolean(concert)) &&
    ((lane !== "meet" || access === "ot7" || Boolean(memberId)) &&
      (!meetAddOn || Boolean(memberId)));

  function confirm() {
    if (!ready || !one || !group) return;
    const offer = access === "ot7" ? group : one;
    const accessPick = {
      id: offer.id,
      title: offer.title,
      price: offer.price,
      memberId: access === "ot7" ? undefined : memberId || undefined,
    };

    if (ownCity) {
      if (lane === "meet") {
        const who = access === "ot7" ? "All seven" : shopMembers.find((member) => member.id === memberId)?.stageName;
        addStay(
          buildCustomHold({
            kind: "meet",
            city: place,
            hotel,
            price: offer.price,
            title: [offer.title, who, place].filter(Boolean).join(" · "),
          }),
          { open: false }
        );
      } else if (lane === "reserve") {
        const each = tier === "vip" ? vip : ga;
        addStay(
          buildCustomHold({
            kind: "reserve",
            city: place,
            hotel,
            price: each * party,
            title: `${party} × ${tier === "vip" ? "VIP" : "GA"} · ${place}`,
          }),
          { open: false }
        );
      } else {
        addStay(
          buildCustomHold({
            kind: "vacation",
            city: place,
            hotel,
            price: stay.price + (meetAddOn ? one.price : 0),
            nights: stay.nights,
            title: `${place} · ${stay.nights} nights · ${hotel}`,
          }),
          { open: false }
        );
      }
      router.push("/checkout");
      return;
    }

    if (!concert) return;
    if (lane === "meet") {
      addSeat(buildHeldSeat(concert, "vip", 0, accessPick, hotel), { open: false });
    } else if (lane === "reserve") {
      for (let index = 0; index < party; index += 1) {
        addSeat(buildHeldSeat(concert, tier, index, undefined, index === 0 ? hotel : undefined), { open: false });
      }
    } else {
      addSeat(
        buildHeldSeat(concert, "ga", 0, meetAddOn ? { ...accessPick, id: one.id, title: one.title, price: one.price } : undefined, hotel),
        { open: false }
      );
      addStay(buildCityStay(concert, stayNights, stay.price, hotel), { open: false });
    }
    router.push("/checkout");
  }

  const title = lane === "meet" ? "Meet & Greet" : lane === "reserve" ? "Reservation" : "Vacation";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap gap-2">
        {bookLanes.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              item.id === lane ? "bg-gold text-charcoal" : "bg-white/5 text-cream/70"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-cream">{title}</h1>
      <p className="mt-2 text-sm text-cream/55">Pick a place, pick a hotel, then confirm. Your card is not charged here.</p>

      <Section title="Where do you want to be?">
        <div className="flex flex-wrap gap-2">
          {cities.map(([name]) => (
            <Pick key={name} selected={!ownCity && city === name} label={name} onClick={() => { setOwnCity(false); setCity(name); setHotelId(""); }} />
          ))}
          <Pick selected={ownCity} label="Somewhere else" onClick={() => { setOwnCity(true); setHotelId("custom"); }} />
        </div>
        {ownCity && (
          <Input
            className="mt-3"
            placeholder="Type the city"
            value={customCity}
            onChange={(event) => setCustomCity(event.target.value)}
          />
        )}
        {!ownCity && cityNights.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {cityNights.map((night) => (
              <Pick
                key={night.id}
                selected={concert?.id === night.id}
                label={formatDate(night.date)}
                onClick={() => setConcertId(night.id)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Which hotel works for you?">
        <div className="flex flex-wrap gap-2">
          {hotels.map((item) => (
            <Pick
              key={item.id}
              selected={hotelId === item.id}
              label={item.name}
              hint={item.area}
              onClick={() => setHotelId(item.id)}
            />
          ))}
          <Pick selected={hotelId === "custom"} label="My hotel" onClick={() => setHotelId("custom")} />
        </div>
        {hotelId === "custom" && (
          <Input
            className="mt-3"
            placeholder="Type the hotel"
            value={customHotel}
            onChange={(event) => setCustomHotel(event.target.value)}
          />
        )}
      </Section>

      {lane === "meet" && (
        <Section title="Who do you want to meet?">
          <div className="flex flex-wrap gap-2">
            {shopMembers.map((member) => (
              <Pick key={member.id} selected={memberId === member.id && access === "member"} label={member.stageName} onClick={() => { setMemberId(member.id); setAccess("member"); }} />
            ))}
            <Pick selected={access === "ot7"} label={`All seven · ${formatPrice(group?.price ?? 2400)}`} onClick={() => setAccess("ot7")} />
          </div>
        </Section>
      )}

      {lane === "reserve" && (
        <Section title="What kind of seats?">
          <div className="flex flex-wrap gap-2">
            <Pick selected={tier === "ga"} label={`GA · ${formatPrice(ga)}`} onClick={() => setTier("ga")} />
            <Pick selected={tier === "vip"} label={`VIP · ${formatPrice(vip)}`} onClick={() => setTier("vip")} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
              <Pick key={count} selected={party === count} label={String(count)} onClick={() => setParty(count)} />
            ))}
          </div>
        </Section>
      )}

      {lane === "vacation" && (
        <Section title="How many nights?">
          <div className="flex flex-wrap gap-2">
            {STAY_RATES.map((rate) => (
              <Pick
                key={rate.nights}
                selected={stayNights === rate.nights}
                label={`${rate.label} · ${formatPrice(rate.price)}`}
                onClick={() => setStayNights(rate.nights)}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pick selected={!meetAddOn} label="Stay only" onClick={() => setMeetAddOn(false)} />
            <Pick selected={meetAddOn} label={`Add a meet · ${formatPrice(one?.price ?? 1250)}`} onClick={() => setMeetAddOn(true)} />
          </div>
          {meetAddOn && (
            <div className="mt-4 flex flex-wrap gap-2">
              {shopMembers.map((member) => (
                <Pick key={member.id} selected={memberId === member.id} label={member.stageName} onClick={() => setMemberId(member.id)} />
              ))}
            </div>
          )}
        </Section>
      )}

      <aside className="mt-8 rounded-3xl border border-gold/30 bg-white/5 p-6">
        <p className="text-sm text-cream/50">{place || "Choose a city"}{hotel ? ` · ${hotel}` : ""}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {quote.map((line) => (
            <li key={line.label} className="flex justify-between gap-4">
              <span className="text-cream/70">{line.label}</span>
              <span className="font-semibold text-cream">{formatPrice(line.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-lg font-bold text-cream">{formatPrice(total)}</span>
          <Button onClick={confirm} disabled={!ready}>Confirm</Button>
        </div>
        <p className="mt-3 text-xs text-cream/45">We confirm the hotel with you. This page does not reserve the room or charge your card.</p>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-cream">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Pick({
  selected,
  label,
  hint,
  onClick,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-left text-sm ${
        selected ? "border-gold bg-gold text-charcoal" : "border-white/15 text-cream"
      }`}
    >
      <span className="font-semibold">{label}</span>
      {hint && <span className={`ml-2 text-xs ${selected ? "text-charcoal/70" : "text-cream/45"}`}>{hint}</span>}
    </button>
  );
}
