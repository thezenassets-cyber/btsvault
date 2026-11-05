import { getMemberName } from "@/data/members";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderLineItem } from "@/lib/types";

const LANE: Record<string, string> = {
  meet: "Meet & Greet",
  reserve: "Reservation",
  vacation: "Vacation",
};

/** Text the desk reads. Includes are already in the guest's language. */
export function bookingItinerary(items: OrderLineItem[]) {
  const seats = items.filter((item) => item.seat?.concertId);
  const stays = items.filter((item) => item.stay);
  if (seats.length === 0 && stays.length === 0) return "";

  const lines: string[] = [];
  for (const item of stays) {
    const stay = item.stay!;
    lines.push(LANE[stay.kind || ""] || "Hold");
    if (stay.budgetId) lines.push(`Budget: ${stay.budgetId}`);
    const place = [stay.city, stay.date ? formatDate(stay.date) : "", stay.venue && stay.venue !== stay.city ? stay.venue : ""]
      .filter(Boolean)
      .join(" · ");
    if (place) lines.push(place);
    if (stay.memberId) {
      lines.push(`Member: ${stay.memberId === "ot7" ? "OT7" : getMemberName(stay.memberId)}`);
    }
    if (stay.hotel) lines.push(`Hotel: ${stay.hotel}`);
    if (stay.party) lines.push(`Guests: ${stay.party}`);
    lines.push(stay.title);
    lines.push(formatPrice(stay.price));
    for (const line of stay.includes || []) lines.push(`- ${line}`);
  }

  for (const item of seats) {
    const seat = item.seat!;
    lines.push(
      [seat.city, seat.date ? formatDate(seat.date) : "", seat.venue].filter(Boolean).join(" · ")
    );
    if (seat.hotel) lines.push(`Hotel: ${seat.hotel}`);
    lines.push(
      `${seat.sectionId} ${seat.sectionLabel} · Row ${seat.row} Seat ${seat.seat} · ${formatPrice(seat.price)}`
    );
    if (seat.privateAccess) {
      const who = seat.privateAccess.memberId ? getMemberName(seat.privateAccess.memberId) : "";
      lines.push([seat.privateAccess.title, who, formatPrice(seat.privateAccess.price)].filter(Boolean).join(" · "));
    }
  }

  return lines.filter(Boolean).join("\n");
}
