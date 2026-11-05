import { getProductById } from "@/data/products";
import { getPrivateAccess } from "@/data/private-access";
import { getProductPrice } from "@/lib/catalog";

export type BookingLane = "meet" | "reserve" | "vacation";

export const STAY_RATES = [
  { nights: 2, price: 420, label: "2 nights" },
  { nights: 3, price: 590, label: "3 nights" },
  { nights: 5, price: 890, label: "5 nights" },
] as const;

export type StayNights = (typeof STAY_RATES)[number]["nights"];

export function gaListPrice() {
  const product = getProductById("ticket-ga-1");
  return product ? getProductPrice(product) : 199;
}

export function vipListPrice() {
  const product = getProductById("ticket-vip-1");
  return product ? getProductPrice(product) : 449;
}

export function meetMemberOffer() {
  return getPrivateAccess("meet-greet");
}

export function meetGroupOffer() {
  return getPrivateAccess("meet-greet-ot7");
}

export function stayRate(nights: number) {
  return STAY_RATES.find((rate) => rate.nights === nights) ?? STAY_RATES[0];
}

export function isBookingLane(value: string | null): value is BookingLane {
  return value === "meet" || value === "reserve" || value === "vacation";
}
