import { gaListPrice, vipListPrice, type StayNights } from "@/data/booking";
import { ROLL_META, seatSections } from "@/data/seating";
import type { CityStayHold, Concert, PrivateAccessSelection, SeatHold } from "@/lib/types";

export function buildHeldSeat(
  concert: Concert,
  tier: "ga" | "vip",
  index: number,
  access?: PrivateAccessSelection,
  hotel?: string
): SeatHold {
  const section = seatSections.find((item) => item.id === (tier === "vip" ? "F4L" : "B1"));
  if (!section) throw new Error("Seat chart is missing the booking section");
  const seat = index + 1;
  return {
    lineId: `${concert.id}-${section.id}-r1-s${seat}`,
    concertId: concert.id,
    city: concert.city,
    country: concert.country,
    venue: concert.venue,
    date: concert.date,
    image: concert.image || "/concerts/arirang-hero.jpg",
    roll: section.roll,
    rollLabel: ROLL_META[section.roll].label,
    sectionId: section.id,
    sectionLabel: section.label,
    row: 1,
    seat,
    price: tier === "vip" ? vipListPrice() : gaListPrice(),
    privateAccess: index === 0 ? access : undefined,
    hotel: index === 0 ? hotel : undefined,
  };
}

export function buildCityStay(
  concert: Concert,
  nights: StayNights,
  price: number,
  hotel: string
): CityStayHold {
  return {
    lineId: `stay-${concert.id}-${nights}`,
    concertId: concert.id,
    city: concert.city,
    country: concert.country,
    venue: concert.venue,
    date: concert.date,
    nights,
    price,
    image: concert.image || "/concerts/arirang-hero.jpg",
    title: `${concert.city} · ${nights} nights · ${hotel}`,
    detail: "Your city and hotel. We confirm the stay with you. This is not a live hotel booking.",
    hotel,
    kind: "vacation",
  };
}

export function buildCustomHold(input: {
  kind: "meet" | "reserve" | "vacation";
  city: string;
  hotel: string;
  price: number;
  title: string;
  nights?: number;
}): CityStayHold {
  const slug = input.city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "city";
  return {
    lineId: `${input.kind}-${slug}-${input.hotel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    concertId: `custom-${slug}`,
    city: input.city,
    country: "",
    venue: "",
    date: "",
    nights: input.nights ?? 0,
    price: input.price,
    image: "/concerts/arirang-hero.jpg",
    title: input.title,
    detail: "Your city and hotel. We confirm this with you.",
    hotel: input.hotel,
    kind: input.kind,
  };
}
