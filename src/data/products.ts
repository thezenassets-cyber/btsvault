import type { Product, ShopMemberId } from "@/lib/types";
import { albumProducts } from "@/data/albums";
import { albumExpansion } from "@/data/album-expansion";
import { officialMerch } from "@/data/official-merch";
import { memberBoutique } from "@/data/member-boutique";
import { ticketProducts } from "@/data/tickets";
import { productGalleryImage, productImage } from "@/lib/images";

/** Single catalog merge — image always from `/products/{slug}.jpg` */
export const products: Product[] = [
  ...albumProducts,
  ...albumExpansion,
  ...officialMerch,
  ...memberBoutique,
  ...ticketProducts,
].map((p) => {
  const gallery =
    p.type === "album" ||
    p.type === "lightstick" ||
    p.type === "experience" ||
    p.rarity === "limited" ||
    p.rarity === "out-of-print"
      ? [productGalleryImage(p.slug, 1)]
      : undefined;
  return {
    ...p,
    image: productImage(p.slug),
    gallery,
  };
});

export function getProductPrimaryMember(product: Product): ShopMemberId | undefined {
  if (product.primaryMember) return product.primaryMember;
  const solo = product.members.find((m) => m !== "ot7");
  return solo as ShopMemberId | undefined;
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 4) {
  const primary = getProductPrimaryMember(product);
  const sameMember = primary
    ? products.filter(
        (p) => p.id !== product.id && getProductPrimaryMember(p) === primary
      )
    : [];
  const fallback = products.filter(
    (p) =>
      p.id !== product.id &&
      !sameMember.some((s) => s.id === p.id) &&
      (p.era === product.era || p.type === product.type)
  );
  return [...sameMember, ...fallback].slice(0, limit);
}

export function getProductsByEra(eraId: string) {
  return products.filter((p) => p.era === eraId);
}

export function getFeaturedProducts(limit = 8) {
  const priority = [
    "arirang-album-set",
    "wings-album",
    "you-never-walk-alone",
    "love-yourself-answer",
    "rm-right-place-wrong-person",
    "jimin-muse-album",
    "jungkook-golden-album",
    "bts-official-light-stick-ver4",
    "army-membership-kit-2026",
    "arirang-ticket-ga",
    "arirang-ticket-bulk-8",
    "v-layover-lp",
    "bts-incense-stick-arirang",
    "jungkook-golden-online-meet",
  ];
  const featured = priority
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];
  const rest = products.filter((p) => p.inStock && !featured.includes(p));
  return [...featured, ...rest].slice(0, limit);
}

export function getGrailProducts(limit = 4) {
  const priority = [
    "2-cool-4-skool",
    "ot7-signed-group-poster",
    "rm-signed-indigo-booklet",
    "jin-signed-astronaut-polaroid",
    "suga-signed-agust-d-art-print",
    "jungkook-signed-golden-vinyl-sleeve",
    "o-rul8-2",
    "agust-d-mixtape",
  ];
  const picked = priority
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as Product[];
  if (picked.length >= limit) return picked.slice(0, limit);
  const more = products.filter(
    (p) =>
      !picked.includes(p) &&
      (p.rarity === "out-of-print" || p.type === "autograph")
  );
  return [...picked, ...more].slice(0, limit);
}

export function getTicketProducts() {
  return products.filter((p) => p.tags.includes("ticket"));
}
