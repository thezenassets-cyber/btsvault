import type { FilterState, MemberShopStats, MemberShopTab, Product, ShopMemberId } from "@/lib/types";
import { products, getProductPrimaryMember } from "@/data/products";

export function productBelongsToMember(product: Product, memberId: ShopMemberId): boolean {
  return product.primaryMember === memberId || product.members.includes(memberId);
}

export function getProductPrice(product: Product): number {
  return product.memberPrice ?? product.listingPrice ?? product.msrp;
}

export function filterProducts(filters: FilterState): Product[] {
  return products.filter((product) => {
    if (filters.inStockOnly && !product.inStock) return false;
    if (filters.era !== "all" && product.era !== filters.era) return false;
    if (filters.member !== "all" && filters.member !== "ot7") {
      if (!productBelongsToMember(product, filters.member as ShopMemberId)) return false;
    } else if (filters.member === "ot7" && !product.members.includes("ot7")) {
      return false;
    }
    if (filters.type !== "all" && product.type !== filters.type) return false;
    if (filters.rarity !== "all" && product.rarity !== filters.rarity) return false;
    if (filters.format && filters.format !== "all") {
      if (product.experienceFormat !== filters.format && !product.tags.includes(filters.format)) {
        return false;
      }
    }

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      const haystack = [
        product.name,
        product.description,
        product.type,
        product.era,
        product.primaryMember ?? "",
        product.experienceFormat ?? "",
        ...product.tags,
        ...product.members,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function searchProducts(query: string, limit = 8): Product[] {
  if (!query.trim()) return [];
  return filterProducts({
    query,
    era: "all",
    member: "all",
    type: "all",
    rarity: "all",
    inStockOnly: false,
  }).slice(0, limit);
}

export function getProductsByMember(memberId: ShopMemberId): Product[] {
  return products.filter((p) => productBelongsToMember(p, memberId));
}

export function getMemberShopStats(memberId: ShopMemberId): MemberShopStats {
  const items = getProductsByMember(memberId);
  const prices = items.map(getProductPrice);
  const inStockCount = items.filter((p) => p.inStock).length;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  return {
    totalItems: items.length,
    inStockCount,
    minPrice,
    maxPrice,
    avgPrice: Math.round(avgPrice),
    estimatedCatalogValue: Math.round(prices.reduce((a, b) => a + b, 0)),
  };
}

export function getMemberFeatured(memberId: ShopMemberId, limit = 3): Product[] {
  return getProductsByMember(memberId)
    .filter((p) => p.inStock)
    .sort((a, b) => getProductPrice(b) - getProductPrice(a))
    .slice(0, limit);
}

export function getMemberHandouts(memberId: ShopMemberId): Product[] {
  return getProductsByMember(memberId).filter(
    (p) =>
      p.includesPhotocard ||
      p.tags.some((t) =>
        ["photocard", "postcard", "sticker", "handout", "inclusion"].includes(t)
      ) ||
      p.type === "merch"
  );
}

export function filterMemberProducts(
  memberId: ShopMemberId,
  tab: MemberShopTab
): Product[] {
  const items = getProductsByMember(memberId);
  switch (tab) {
    case "albums":
      return items.filter((p) => p.type === "album" || p.type === "photobook");
    case "handouts":
      return getMemberHandouts(memberId);
    case "apparel":
      return items.filter((p) => p.type === "apparel" || p.type === "accessory");
    case "scent":
      return items.filter((p) => p.type === "fragrance");
    case "jewelry":
      return items.filter((p) => p.type === "jewelry");
    case "cards":
      return items.filter(
        (p) => p.type === "army-card" || p.type === "membership" || p.includesPhotocard
      );
    case "experiences":
      return items.filter((p) => p.type === "experience" || p.type === "autograph");
    case "rare":
      return items.filter(
        (p) =>
          p.rarity === "limited" ||
          p.rarity === "out-of-print" ||
          p.rarity === "tour-exclusive"
      );
    default:
      return items;
  }
}

export function getMemberCompletion(ownedProductIds: string[], memberId: ShopMemberId) {
  const memberProductsList = getProductsByMember(memberId);
  const owned = memberProductsList.filter((p) => ownedProductIds.includes(p.id));
  return {
    total: memberProductsList.length,
    owned: owned.length,
    percentage: memberProductsList.length
      ? Math.round((owned.length / memberProductsList.length) * 100)
      : 0,
    missing: memberProductsList.filter((p) => !ownedProductIds.includes(p.id)),
  };
}

export function getMemberStarterBundle(memberId: ShopMemberId): Product[] {
  const featured = getMemberFeatured(memberId, 3);
  if (featured.length >= 3) return featured;
  return getProductsByMember(memberId).filter((p) => p.inStock).slice(0, 3);
}

export function getEraCompletion(ownedProductIds: string[], eraId: string) {
  const eraProducts = products.filter((p) => p.era === eraId);
  const owned = eraProducts.filter((p) => ownedProductIds.includes(p.id));
  return {
    total: eraProducts.length,
    owned: owned.length,
    percentage: eraProducts.length ? Math.round((owned.length / eraProducts.length) * 100) : 0,
    missing: eraProducts.filter((p) => !ownedProductIds.includes(p.id)),
  };
}

export const productTypes = [
  { id: "all", label: "All Types" },
  { id: "album", label: "Albums" },
  { id: "photobook", label: "Photobooks" },
  { id: "apparel", label: "Apparel" },
  { id: "fragrance", label: "Fragrance" },
  { id: "jewelry", label: "Jewelry" },
  { id: "membership", label: "Membership" },
  { id: "army-card", label: "ARMY Cards" },
  { id: "autograph", label: "Autographs" },
  { id: "experience", label: "Experiences" },
  { id: "accessory", label: "Accessories" },
  { id: "lightstick", label: "Light Sticks" },
  { id: "dvd", label: "DVD / Blu-ray" },
  { id: "merch", label: "Merchandise" },
  { id: "collab", label: "Collaborations" },
] as const;

export const rarityOptions = [
  { id: "all", label: "All Rarities" },
  { id: "standard", label: "Standard" },
  { id: "limited", label: "Limited" },
  { id: "out-of-print", label: "Out of Print" },
  { id: "tour-exclusive", label: "Tour Exclusive" },
] as const;

export const memberShopTabs: { id: MemberShopTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "apparel", label: "Apparel" },
  { id: "scent", label: "Scent" },
  { id: "jewelry", label: "Jewelry" },
  { id: "cards", label: "Cards" },
  { id: "experiences", label: "Experiences" },
  { id: "albums", label: "Albums" },
  { id: "handouts", label: "Photocards" },
  { id: "rare", label: "Rare" },
];
