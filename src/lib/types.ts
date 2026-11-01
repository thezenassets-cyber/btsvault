export type MemberId =
  | "rm"
  | "jin"
  | "suga"
  | "jhope"
  | "jimin"
  | "v"
  | "jungkook"
  | "ot7";

export type ShopMemberId = Exclude<MemberId, "ot7">;

export type EraId =
  | "2c4s"
  | "hyyh"
  | "wings"
  | "ly"
  | "mots"
  | "be"
  | "proof"
  | "solo";

export type ProductType =
  | "album"
  | "photobook"
  | "apparel"
  | "accessory"
  | "lightstick"
  | "dvd"
  | "merch"
  | "collab"
  | "jewelry"
  | "fragrance"
  | "membership"
  | "army-card"
  | "autograph"
  | "experience";

export type Rarity = "standard" | "limited" | "out-of-print" | "tour-exclusive";

export type Condition = "sealed" | "like-new" | "good" | "fair";

export type ApparelSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface Member {
  id: MemberId;
  name: string;
  stageName: string;
  color: string;
  heroImage: string;
  portraitImage: string;
  tagline: string;
  bio: string;
  accentGradient: string;
  soloHighlight: string;
  shopBadge: string;
}

export type ShopMember = Omit<Member, "id"> & { id: ShopMemberId };

export interface Era {
  id: EraId;
  name: string;
  years: string;
  description: string;
  stripClass: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: ProductType;
  era: EraId;
  members: MemberId[];
  primaryMember?: ShopMemberId;
  rarity: Rarity;
  releaseDate: string;
  msrp: number;
  currency: string;
  image: string;
  /** Optional secondary PDP shots — always local `/products/{slug}-*.jpg` */
  gallery?: string[];
  tags: string[];
  inStock: boolean;
  listingPrice?: number;
  memberPrice?: number;
  condition?: Condition;
  authenticityNotes?: string;
  inclusionCount?: number;
  includesPhotocard?: boolean;
  sku?: string;
  scentNotes?: string[];
  sizeOptions?: ApparelSize[];
  memberSignature?: string;
  experienceId?: string;
  /** Online (virtual) vs in-person stadium/city meet */
  experienceFormat?: "online" | "in-person";
  concertId?: string;
  city?: string;
}

export type ExperienceFormat = "online" | "in-person";

export interface Experience {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: "fan-sign" | "hi-touch" | "video-call" | "fan-meeting" | "meet-greet";
  status: "open" | "closed" | "upcoming";
  format: ExperienceFormat;
  opensAt: string;
  closesAt: string;
  eligibleMembers: MemberId[];
  maxApplicants: number;
  currentApplicants: number;
  requirements: string[];
  image?: string;
  city?: string;
  concertId?: string;
}

export interface Concert {
  id: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  tourName: string;
  region: "asia" | "americas" | "europe" | "oceania";
  status: "past" | "upcoming" | "onsale";
  image?: string;
}

export interface ExperienceApplication {
  id: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
  eventSlug: string;
  eventTitle: string;
  memberId: MemberId;
  format: ExperienceFormat;
  fullName: string;
  email: string;
  notes?: string;
  adminNotes?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface CollectionItem {
  productId: string;
  addedAt: string;
  purchasePrice?: number;
  condition: Condition;
  notes?: string;
}

export type RollId = "front" | "middle" | "back";

export type ClientTier = "guest" | "member" | "private";

export interface PrivateAccessSelection {
  id: string;
  title: string;
  price: number;
  memberId?: MemberId;
}

/** A held stadium seat. Quantity is always 1. */
export interface SeatHold {
  lineId: string;
  concertId: string;
  city: string;
  country: string;
  venue: string;
  date: string;
  image: string;
  roll: RollId;
  rollLabel: string;
  sectionId: string;
  sectionLabel: string;
  row: number;
  seat: number;
  price: number;
  privateAccess?: PrivateAccessSelection;
}

export interface ClientCardProfile {
  holderName: string;
  number: string;
  code: string;
  issuedAt: string;
}

export interface TicketStub {
  id: string;
  orderId: string;
  concertId: string;
  city: string;
  venue: string;
  date: string;
  image: string;
  rollLabel: string;
  sectionId?: string;
  sectionLabel: string;
  row: number;
  seat: number;
  price: number;
  privateAccessTitle?: string;
  memberId?: MemberId;
  clientCardNumber: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
  selectedSize?: ApparelSize;
  /** Unique key for a seat line. Merch lines omit this. */
  lineId?: string;
  seat?: SeatHold;
}

export type FilterState = {
  query: string;
  era: EraId | "all";
  member: MemberId | "all";
  type: ProductType | "all";
  rarity: Rarity | "all";
  inStockOnly: boolean;
  format?: ExperienceFormat | "all";
};

export type MemberShopTab =
  | "all"
  | "albums"
  | "handouts"
  | "apparel"
  | "scent"
  | "jewelry"
  | "cards"
  | "experiences"
  | "rare";

export interface MemberShopStats {
  totalItems: number;
  inStockCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  estimatedCatalogValue: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  cardholderName: string;
  last4: string;
  brand: string;
}

export type OrderStatus = "paid_demo" | "pending" | "failed";

export interface OrderLineItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: ApparelSize;
  image: string;
  lineId?: string;
  seat?: SeatHold;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  shipping: ShippingAddress;
  payment: PaymentDetails;
  items: OrderLineItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  clientCardNumber?: string;
}
