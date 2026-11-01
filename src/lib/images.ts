/** Local high-res member and product asset helpers — single source of truth */

export function memberHeroImage(memberId: string) {
  return `/members/${memberId}/hero.jpg`;
}

export function memberPortraitImage(memberId: string) {
  return `/members/${memberId}/portrait.jpg`;
}

export function memberAvatarImage(memberId: string) {
  return `/members/${memberId}/shop-avatar.jpg`;
}

/** Primary product shot — always `/products/{slug}.jpg` */
export function productImage(slug: string) {
  return `/products/${slug}.jpg`;
}

/** Secondary gallery shot */
export function productGalleryImage(slug: string, index: number) {
  return `/products/${slug}-g${index}.jpg`;
}
