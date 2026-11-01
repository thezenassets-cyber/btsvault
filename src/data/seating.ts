import type { RollId } from "@/lib/types";

export interface SeatSection {
  id: string;
  roll: RollId;
  label: string;
  price: number;
  rows: number;
  seatsPerRow: number;
  /** 0 is stage-left outer, 4 is stage-right outer. */
  slot: number;
}

export const ROLL_META: Record<
  RollId,
  { label: string; blurb: string; rows: string }
> = {
  front: {
    label: "Front Roll",
    blurb: "Floor in front of the stage",
    rows: "Barricade through the front outer blocks",
  },
  middle: {
    label: "Middle Roll",
    blurb: "Lower bowl",
    rows: "Center, sides, and corners",
  },
  back: {
    label: "Back Roll",
    blurb: "Upper bowl",
    rows: "Center, sides, and upper corners",
  },
};

/** Shared stage chart. Prices are Vault list prices in USD, same in every city. */
export const seatSections: SeatSection[] = [
  { id: "F4L", roll: "front", label: "Front Outer", price: 449, rows: 6, seatsPerRow: 10, slot: 0 },
  { id: "F2", roll: "front", label: "Front Left", price: 549, rows: 6, seatsPerRow: 12, slot: 1 },
  { id: "F1", roll: "front", label: "Barricade Center", price: 649, rows: 6, seatsPerRow: 14, slot: 2 },
  { id: "F3", roll: "front", label: "Front Right", price: 549, rows: 6, seatsPerRow: 12, slot: 3 },
  { id: "F4R", roll: "front", label: "Front Outer", price: 449, rows: 6, seatsPerRow: 10, slot: 4 },

  { id: "M4L", roll: "middle", label: "Corner", price: 249, rows: 8, seatsPerRow: 12, slot: 0 },
  { id: "M2", roll: "middle", label: "Left", price: 279, rows: 8, seatsPerRow: 14, slot: 1 },
  { id: "M1", roll: "middle", label: "Center", price: 329, rows: 8, seatsPerRow: 16, slot: 2 },
  { id: "M3", roll: "middle", label: "Right", price: 279, rows: 8, seatsPerRow: 14, slot: 3 },
  { id: "M4R", roll: "middle", label: "Corner", price: 249, rows: 8, seatsPerRow: 12, slot: 4 },

  { id: "B4L", roll: "back", label: "Upper Corner", price: 149, rows: 10, seatsPerRow: 14, slot: 0 },
  { id: "B2", roll: "back", label: "Left", price: 169, rows: 10, seatsPerRow: 16, slot: 1 },
  { id: "B1", roll: "back", label: "Center", price: 189, rows: 10, seatsPerRow: 18, slot: 2 },
  { id: "B3", roll: "back", label: "Right", price: 169, rows: 10, seatsPerRow: 16, slot: 3 },
  { id: "B4R", roll: "back", label: "Upper Corner", price: 149, rows: 10, seatsPerRow: 14, slot: 4 },
];

export const LOWEST_SEAT_PRICE = 149;

export function sectionsForRoll(roll: RollId) {
  return seatSections.filter((s) => s.roll === roll).sort((a, b) => a.slot - b.slot);
}

export function getSection(id: string) {
  return seatSections.find((s) => s.id === id);
}

export function seatKey(sectionId: string, row: number, seat: number) {
  return `${sectionId}-${row}-${seat}`;
}

/** Chart code. Section ids stay distinct when labels repeat, such as both Front Outers. */
export function seatCode(sectionId: string, row: number, seat: number) {
  return `${sectionId}-R${String(row).padStart(2, "0")}-S${String(seat).padStart(2, "0")}`;
}

/** Readable admit code. Parsed from the concert id so older orders still resolve. */
export function admitCode(concertId: string, sectionId: string, row: number, seat: number) {
  const match = concertId.match(/^arirang-(.+)-(\d{4})-(\d{2})-(\d{2})$/);
  const city = match ? match[1].replace(/-/g, "").toUpperCase() : concertId.toUpperCase();
  const mmdd = match ? `${match[3]}${match[4]}` : "0000";
  return `${city}-${mmdd}-${seatCode(sectionId, row, seat)}`;
}

export function openSeatCount(concertId: string, section: SeatSection, taken: Set<string>) {
  let open = 0;
  for (let row = 1; row <= section.rows; row++) {
    for (let seat = 1; seat <= section.seatsPerRow; seat++) {
      if (taken.has(seatKey(section.id, row, seat))) continue;
      if (isSeatSold(concertId, section.id, row, seat)) continue;
      open += 1;
    }
  }
  return open;
}

export function bestInSection(
  concertId: string,
  section: SeatSection,
  taken: Set<string>
): OpenSeat | null {
  const seatOrder = seatsFromCenter(section.seatsPerRow);
  for (let row = 1; row <= section.rows; row++) {
    for (const seat of seatOrder) {
      const key = seatKey(section.id, row, seat);
      if (taken.has(key)) continue;
      if (isSeatSold(concertId, section.id, row, seat)) continue;
      return { section, row, seat };
    }
  }
  return null;
}

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable sold pattern so each night looks different without a database. */
export function isSeatSold(concertId: string, sectionId: string, row: number, seat: number) {
  const n = hash(`${concertId}:${sectionId}:${row}:${seat}`);
  return n % 100 < 28;
}

export interface OpenSeat {
  section: SeatSection;
  row: number;
  seat: number;
}

function seatsFromCenter(count: number) {
  const mid = Math.ceil(count / 2);
  const order: number[] = [];
  for (let offset = 0; offset < count; offset++) {
    const right = mid + offset;
    const left = mid - offset;
    if (offset === 0) {
      if (right <= count) order.push(right);
      continue;
    }
    if (left >= 1) order.push(left);
    if (right <= count && right !== left) order.push(right);
  }
  return order;
}

const ROLL_PRIORITY: RollId[] = ["front", "middle", "back"];

export function bestAvailable(
  concertId: string,
  roll: RollId,
  taken: Set<string>
): OpenSeat | null {
  const sections = [...sectionsForRoll(roll)].sort((a, b) => {
    const da = Math.abs(a.slot - 2);
    const db = Math.abs(b.slot - 2);
    return da - db;
  });
  for (const section of sections) {
    const seatOrder = seatsFromCenter(section.seatsPerRow);
    for (let row = 1; row <= section.rows; row++) {
      for (const seat of seatOrder) {
        const key = seatKey(section.id, row, seat);
        if (taken.has(key)) continue;
        if (isSeatSold(concertId, section.id, row, seat)) continue;
        return { section, row, seat };
      }
    }
  }
  return null;
}

export function bestAvailableAny(concertId: string, taken: Set<string>) {
  for (const roll of ROLL_PRIORITY) {
    const found = bestAvailable(concertId, roll, taken);
    if (found) return found;
  }
  return null;
}

/** Next free seat touching the current hold, same row first. */
export function nextAdjacent(
  concertId: string,
  held: OpenSeat[],
  taken: Set<string>
): OpenSeat | null {
  if (held.length === 0) return bestAvailableAny(concertId, taken);
  const occupied = new Set(taken);
  for (const seat of held) occupied.add(seatKey(seat.section.id, seat.row, seat.seat));

  for (const seat of held) {
    for (const delta of [1, -1]) {
      const next = seat.seat + delta;
      if (next < 1 || next > seat.section.seatsPerRow) continue;
      const key = seatKey(seat.section.id, seat.row, next);
      if (occupied.has(key)) continue;
      if (isSeatSold(concertId, seat.section.id, seat.row, next)) continue;
      return { section: seat.section, row: seat.row, seat: next };
    }
  }
  return null;
}
