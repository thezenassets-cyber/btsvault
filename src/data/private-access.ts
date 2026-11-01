import type { MemberId } from "@/lib/types";

export interface PrivateAccessOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  requiresMember: boolean;
}

/** Booked with a seat. Priced once per hold, not per ticket. */
export const privateAccessOffers: PrivateAccessOffer[] = [
  {
    id: "soundcheck",
    title: "Soundcheck",
    description: "Early entry for the soundcheck block before doors.",
    price: 180,
    requiresMember: false,
  },
  {
    id: "hi-touch",
    title: "Hi-Touch",
    description: "A brief greeting on the private access line.",
    price: 420,
    requiresMember: true,
  },
  {
    id: "fan-sign",
    title: "Fan Sign",
    description: "Timed signing slot with your chosen member.",
    price: 680,
    requiresMember: true,
  },
  {
    id: "meet-greet",
    title: "Meet & Greet — One Member",
    description: "Private meet and greet with one member after the show.",
    price: 1250,
    requiresMember: true,
  },
  {
    id: "meet-greet-ot7",
    title: "Meet & Greet — OT7",
    description: "Private access with all seven members.",
    price: 2400,
    requiresMember: false,
  },
  {
    id: "photo-line",
    title: "Photo Line",
    description: "Front-of-house photo line before doors.",
    price: 560,
    requiresMember: false,
  },
  {
    id: "lounge",
    title: "Private Lounge + City Merch",
    description: "Lounge entry plus a city merch bundle held at will call.",
    price: 320,
    requiresMember: false,
  },
];

export function getPrivateAccess(id: string) {
  return privateAccessOffers.find((offer) => offer.id === id);
}

export const PRIVATE_ACCESS_MEMBERS: { id: Exclude<MemberId, "ot7">; label: string }[] = [
  { id: "rm", label: "RM" },
  { id: "jin", label: "Jin" },
  { id: "suga", label: "Suga" },
  { id: "jhope", label: "J-Hope" },
  { id: "jimin", label: "Jimin" },
  { id: "v", label: "V" },
  { id: "jungkook", label: "Jungkook" },
];
