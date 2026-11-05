import { getMemberName } from "@/data/members";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderLineItem } from "@/lib/types";

const MEET_IDS = new Set(["meet-greet", "meet-greet-ot7"]);

/** Text the chat desk and the success page both read. */
export function bookingItinerary(items: OrderLineItem[]) {
  const seats = items.filter((item) => item.seat?.concertId);
  const stays = items.filter((item) => item.stay);
  if (seats.length === 0 && stays.length === 0) return "";

  const access = seats.find((item) => item.seat?.privateAccess && MEET_IDS.has(item.seat.privateAccess.id))
    ?.seat?.privateAccess;
  const kind = stays.find((item) => item.stay?.kind)?.stay?.kind;
  const lane =
    kind === "meet" || (!kind && access)
      ? "Meet & Greet"
      : kind === "reserve"
        ? "Reservation"
        : kind === "vacation" || stays.length > 0
          ? "Vacation"
          : "Reservation";
  const first = seats[0]?.seat ?? stays[0]?.stay;
  if (!first) return "";
  const hotel =
    seats.find((item) => item.seat?.hotel)?.seat?.hotel ||
    stays.find((item) => item.stay?.hotel)?.stay?.hotel;

  const member =
    access?.id === "meet-greet-ot7"
      ? "OT7"
      : access?.memberId
        ? getMemberName(access.memberId)
        : "";

  const lines = [
    `Lane: ${lane}`,
    [
      first.city,
      first.date ? formatDate(first.date) : "",
      "venue" in first && first.venue && first.venue !== first.city ? first.venue : "",
    ]
      .filter(Boolean)
      .join(" · "),
    member ? `Member: ${member}` : "",
    hotel ? `Hotel: ${hotel}` : "",
    seats.length > 0 ? `Party: ${seats.length}` : "",
  ];

  for (const item of seats) {
    const seat = item.seat!;
    lines.push(
      `${seat.rollLabel} · ${seat.sectionId} ${seat.sectionLabel} · Row ${seat.row} Seat ${seat.seat} · ${formatPrice(seat.price)}`
    );
    if (seat.privateAccess) {
      lines.push(`${seat.privateAccess.title} · ${formatPrice(seat.privateAccess.price)}`);
    }
  }

  for (const item of stays) {
    const stay = item.stay!;
    lines.push(
      stay.nights > 0
        ? `Stay: ${stay.nights} nights · ${formatPrice(stay.price)}`
        : `${stay.title} · ${formatPrice(stay.price)}`
    );
    lines.push(stay.detail);
  }

  return lines.filter(Boolean).join("\n");
}
