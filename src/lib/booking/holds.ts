import type { CityStayHold } from "@/lib/types";

/** One hold, one price. The budget the guest chose is the line total. */
export function buildBookingHold(input: {
  lane: "meet" | "reserve" | "vacation";
  budgetId: string;
  concertId?: string;
  city: string;
  country: string;
  venue: string;
  date: string;
  hotel: string;
  price: number;
  title: string;
  includes: string[];
  nights?: number;
  memberId?: string;
  party?: number;
  image?: string;
}): CityStayHold {
  const slug = input.city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "city";
  return {
    lineId: `book-${input.lane}-${input.budgetId}-${slug}-${Date.now().toString(36)}`,
    concertId: input.concertId || `custom-${slug}`,
    city: input.city,
    country: input.country,
    venue: input.venue,
    date: input.date,
    nights: input.nights ?? 0,
    price: input.price,
    image: input.image || "/concerts/arirang-hero.jpg",
    title: input.title,
    detail: input.includes.join("\n"),
    hotel: input.hotel,
    kind: input.lane,
    budgetId: input.budgetId,
    memberId: input.memberId,
    party: input.party,
    includes: input.includes,
  };
}
