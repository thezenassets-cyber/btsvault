"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { budgetTotal, budgetsFor, isBookingLane, type BookingLane } from "@/data/booking";
import { getSellableConcerts } from "@/data/concerts";
import { hotelsForCity } from "@/data/hotels";
import { shopMembers } from "@/data/members";
import { buildBookingHold } from "@/lib/booking/holds";
import type { MessageKey } from "@/lib/i18n/catalog";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShopMemberId } from "@/lib/types";

const LANES: { id: BookingLane; key: MessageKey }[] = [
  { id: "meet", key: "book.meet" },
  { id: "reserve", key: "book.reserve" },
  { id: "vacation", key: "book.vacation" },
];

const CITY_KEY: Record<string, MessageKey> = {
  Kaohsiung: "city.kaohsiung",
  Bangkok: "city.bangkok",
  "Kuala Lumpur": "city.kuala",
  Singapore: "city.singapore",
  Jakarta: "city.jakarta",
  Melbourne: "city.melbourne",
  Sydney: "city.sydney",
  "Hong Kong": "city.hongkong",
  Bulacan: "city.bulacan",
};

function budgetKey(id: string, slot: "t" | "a" | "b" | "c"): MessageKey {
  return `b.${id}.${slot}` as MessageKey;
}

export function BookDesk() {
  const params = useSearchParams();
  const router = useRouter();
  const { addStay } = useCart();
  const { t, dateLocale } = useI18n();
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

  const budgets = budgetsFor(lane);
  const [ownCity, setOwnCity] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const [city, setCity] = useState(cities[0]?.[0] ?? "");
  const [concertId, setConcertId] = useState(cities[0]?.[1][0]?.id ?? "");
  const [hotelId, setHotelId] = useState("");
  const [customHotel, setCustomHotel] = useState("");
  const [memberId, setMemberId] = useState<ShopMemberId | "ot7" | "">("");
  const [party, setParty] = useState(2);
  const [budgetId, setBudgetId] = useState(budgets[0]?.id ?? "greeting");

  const cityNights = cities.find(([name]) => name === city)?.[1] ?? [];
  const concert = cityNights.find((night) => night.id === concertId) ?? cityNights[0];
  const hotels = ownCity ? [] : hotelsForCity(city);
  const budget = budgets.find((item) => item.id === budgetId) ?? budgets[0];
  const place = ownCity ? customCity.trim() : city;
  const hotel = (hotelId === "custom" ? customHotel : hotels.find((item) => item.id === hotelId)?.name || "").trim();
  const allSeven = lane === "meet" && memberId === "ot7";
  const chosenMember = lane === "meet" ? memberId : memberId === "ot7" ? "" : memberId;
  const needsMember = lane === "meet" || Boolean(budget?.needsMember);
  const total = budget ? budgetTotal(budget, party, allSeven) : 0;
  const who =
    chosenMember === "ot7"
      ? t("book.seven")
      : shopMembers.find((member) => member.id === chosenMember)?.stageName || "";

  useEffect(() => {
    if (!budgets.some((item) => item.id === budgetId)) setBudgetId(budgets[0]?.id ?? "");
  }, [budgetId, budgets]);

  useEffect(() => {
    if (!cityNights.some((night) => night.id === concertId)) setConcertId(cityNights[0]?.id ?? "");
  }, [city, cityNights, concertId]);

  const ready = Boolean(place && hotel && budget && (!needsMember || chosenMember) && (ownCity || concert));

  function confirm() {
    if (!ready || !budget) return;
    const includes = (["a", "b", "c"] as const).map((slot) => t(budgetKey(budget.id, slot)));
    const title = [t(budgetKey(budget.id, "t")), who, place].filter(Boolean).join(" · ");
    addStay(
      buildBookingHold({
        lane,
        budgetId: budget.id,
        concertId: ownCity ? undefined : concert?.id,
        city: place,
        country: ownCity ? "" : concert?.country || "",
        venue: ownCity ? "" : concert?.venue || "",
        date: ownCity ? "" : concert?.date || "",
        hotel,
        price: total,
        title,
        includes,
        nights: budget.nights,
        memberId: chosenMember || undefined,
        party: lane === "reserve" ? party : undefined,
        image: ownCity ? undefined : concert?.image,
      }),
      { open: false }
    );
    router.push("/checkout");
  }

  const placeLabel = (name: string) => (CITY_KEY[name] ? t(CITY_KEY[name]) : name);
  const priceNote =
    lane === "reserve" ? t("book.eachGuest") : allSeven ? t("book.withSeven") : lane === "meet" ? t("book.withOne") : t("book.theStay");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
      <nav className="flex flex-wrap gap-3">
        {LANES.map((item) => (
          <Link
            key={item.id}
            href={`/book?lane=${item.id}`}
            className={`inline-flex min-h-12 items-center rounded-full px-5 text-sm font-semibold ${
              item.id === lane ? "bg-gold text-charcoal" : "bg-white/5 text-cream/75"
            }`}
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>

      <header className="mt-10 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-cream sm:text-5xl">{t(LANES.find((item) => item.id === lane)?.key || "book.meet")}</h1>
        <p className="mt-4 text-base leading-relaxed text-cream/60">{t("book.intro")}</p>
      </header>

      <div className="mt-14 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section>
            <h2 className="text-lg font-semibold text-cream">{t("book.where")}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cities.map(([name]) => (
                <Choice
                  key={name}
                  selected={!ownCity && city === name}
                  label={placeLabel(name)}
                  onClick={() => {
                    setOwnCity(false);
                    setCity(name);
                    setHotelId("");
                  }}
                />
              ))}
              <Choice
                selected={ownCity}
                label={t("book.somewhere")}
                onClick={() => {
                  setOwnCity(true);
                  setHotelId("custom");
                }}
              />
            </div>
            {ownCity && (
              <Input
                className="mt-4 h-12"
                placeholder={t("book.city")}
                aria-label={t("book.city")}
                value={customCity}
                onChange={(event) => setCustomCity(event.target.value)}
              />
            )}
            {!ownCity && cityNights.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cityNights.map((night) => (
                  <Choice
                    key={night.id}
                    selected={concert?.id === night.id}
                    label={formatDate(night.date, dateLocale)}
                    onClick={() => setConcertId(night.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-cream">{t("book.hotel")}</h2>
            <div className="mt-5 grid gap-3">
              {hotels.map((item) => (
                <Choice
                  key={item.id}
                  selected={hotelId === item.id}
                  label={item.name}
                  hint={item.area}
                  onClick={() => setHotelId(item.id)}
                />
              ))}
              <Choice selected={hotelId === "custom"} label={t("book.myHotel")} onClick={() => setHotelId("custom")} />
            </div>
            {hotelId === "custom" && (
              <Input
                className="mt-4 h-12"
                placeholder={t("book.hotelPh")}
                aria-label={t("book.hotelPh")}
                value={customHotel}
                onChange={(event) => setCustomHotel(event.target.value)}
              />
            )}
          </section>

          {needsMember && (
            <section>
              <h2 className="text-lg font-semibold text-cream">{t("book.who")}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {shopMembers.map((member) => (
                  <Choice
                    key={member.id}
                    selected={memberId === member.id}
                    label={member.stageName}
                    onClick={() => setMemberId(member.id)}
                  />
                ))}
                {lane === "meet" && (
                  <Choice selected={memberId === "ot7"} label={t("book.seven")} onClick={() => setMemberId("ot7")} />
                )}
              </div>
            </section>
          )}

          {lane === "reserve" && (
            <section>
              <h2 className="text-lg font-semibold text-cream">{t("book.guests")}</h2>
              <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-8">
                {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
                  <Choice key={count} selected={party === count} label={String(count)} onClick={() => setParty(count)} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold text-cream">{t("book.budget")}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {budgets.map((item) => {
                const amount = budgetTotal(item, 1, allSeven);
                const selected = budget?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBudgetId(item.id)}
                    className={`flex h-full min-h-64 flex-col rounded-3xl border p-6 text-left sm:p-7 ${
                      selected ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <span className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">{t(budgetKey(item.id, "t"))}</span>
                    <span className="mt-4 font-display text-3xl font-bold text-cream">{formatPrice(amount)}</span>
                    <span className="mt-1 text-sm text-cream/50">{priceNote}</span>
                    <ul className="mt-6 space-y-3 text-sm leading-relaxed text-cream/75">
                      {(["a", "b", "c"] as const).map((slot) => (
                        <li key={slot}>{t(budgetKey(item.id, slot))}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="rounded-3xl border border-gold/30 bg-charcoal-soft p-6 sm:p-8 lg:sticky lg:top-24">
          <p className="text-sm leading-relaxed text-cream/55">
            {place ? placeLabel(place) : t("book.choose")}
            {hotel ? ` · ${hotel}` : ""}
          </p>
          {budget && (
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">{t(budgetKey(budget.id, "t"))}</p>
              {who && <p className="mt-2 text-sm text-cream/70">{who}</p>}
              {lane === "reserve" && (
                <p className="mt-2 text-sm text-cream/70">
                  {party} · {t("lane.party")}
                </p>
              )}
            </div>
          )}
          <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/10 pt-6">
            <span className="text-sm text-cream/50">USD</span>
            <span className="font-display text-3xl font-bold text-cream">{formatPrice(total)}</span>
          </div>
          <Button className="mt-6 h-12 w-full text-base" onClick={confirm} disabled={!ready}>
            {t("book.confirm")}
          </Button>
          <p className="mt-4 text-sm leading-relaxed text-cream/45">{t("book.note")}</p>
        </aside>
      </div>
    </div>
  );
}

function Choice({
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
      className={`min-h-12 rounded-2xl border px-4 py-3 text-left ${
        selected ? "border-gold bg-gold/10 text-cream" : "border-white/10 bg-white/[0.03] text-cream/80"
      }`}
    >
      <span className="block text-sm font-semibold leading-snug">{label}</span>
      {hint && <span className="mt-1 block text-xs leading-relaxed text-cream/45">{hint}</span>}
    </button>
  );
}
