export type BookingLane = "meet" | "reserve" | "vacation";

export interface BookingBudget {
  id: string;
  lane: BookingLane;
  /** One member, one guest, or the whole stay. USD list price. */
  price: number;
  /** Meet & Greet with all seven. */
  groupPrice?: number;
  nights?: number;
  needsMember: boolean;
}

/**
 * One price list for every member.
 * A reservation multiplies by the party. A meet with all seven uses groupPrice.
 * The number on the card is the number at checkout.
 */
export const BOOKING_BUDGETS: BookingBudget[] = [
  { id: "greeting", lane: "meet", price: 3200, groupPrice: 12800, needsMember: true },
  { id: "private", lane: "meet", price: 7500, groupPrice: 28000, needsMember: true },
  { id: "evening", lane: "meet", price: 15000, groupPrice: 48000, needsMember: true },
  { id: "house", lane: "reserve", price: 650, needsMember: false },
  { id: "floor", lane: "reserve", price: 1450, needsMember: false },
  { id: "row", lane: "reserve", price: 3200, needsMember: false },
  { id: "two", lane: "vacation", price: 2400, nights: 2, needsMember: false },
  { id: "four", lane: "vacation", price: 4800, nights: 4, needsMember: false },
  { id: "five", lane: "vacation", price: 9600, nights: 5, needsMember: true },
];

export function budgetsFor(lane: BookingLane) {
  return BOOKING_BUDGETS.filter((budget) => budget.lane === lane);
}

export function budgetById(id: string) {
  return BOOKING_BUDGETS.find((budget) => budget.id === id);
}

/** The amount this card will show. Party size applies only to a reservation. */
export function budgetTotal(budget: BookingBudget, party: number, allSeven: boolean) {
  const each = allSeven && budget.groupPrice ? budget.groupPrice : budget.price;
  if (budget.lane === "reserve") return each * Math.min(8, Math.max(1, party));
  return each;
}

export function isBookingLane(value: string | null): value is BookingLane {
  return value === "meet" || value === "reserve" || value === "vacation";
}
