import type { Member, ShopMember, ShopMemberId } from "@/lib/types";
import { memberHeroImage, memberPortraitImage } from "@/lib/images";

export const shopMembers: ShopMember[] = [
  {
    id: "rm",
    name: "Kim Namjoon",
    stageName: "RM",
    color: "#7b2cbf",
    heroImage: memberHeroImage("rm"),
    portraitImage: memberPortraitImage("rm"),
    tagline: "Indigo · RPWP · Mono",
    bio: "Indigo and Right Place, Wrong Person catalog — albums, scent, and quiet Indigo-season goods.",
    accentGradient: "from-purple-deep via-purple-main to-indigo-900",
    soloHighlight: "Indigo",
    shopBadge: "Indigo / RPWP",
  },
  {
    id: "jin",
    name: "Kim Seokjin",
    stageName: "Jin",
    color: "#ff6b9d",
    heroImage: memberHeroImage("jin"),
    portraitImage: memberPortraitImage("jin"),
    tagline: "Happy · The Astronaut · Echo",
    bio: "Two distinct solo lanes in one shop: bright Happy-era pieces and cool Astronaut / Echo packaging — kept separate, not mashed into one look.",
    accentGradient: "from-sky-400 via-amber-200 to-rose-300",
    soloHighlight: "Happy",
    shopBadge: "Happy + Astronaut",
  },
  {
    id: "suga",
    name: "Min Yoongi",
    stageName: "Suga",
    color: "#4a90d9",
    heroImage: memberHeroImage("suga"),
    portraitImage: memberPortraitImage("suga"),
    tagline: "Agust D · Producer · D-DAY",
    bio: "Dark minimal merch from the Agust D universe. Mixtapes, tour goods, and hip-hop rooted collectibles.",
    accentGradient: "from-slate-900 via-blue-900 to-black",
    soloHighlight: "D-DAY",
    shopBadge: "Agust D Line",
  },
  {
    id: "jhope",
    name: "Jung Hoseok",
    stageName: "J-Hope",
    color: "#ff4757",
    heroImage: memberHeroImage("jhope"),
    portraitImage: memberPortraitImage("jhope"),
    tagline: "Hope · Jack In The Box · Street",
    bio: "Vibrant streetwear and Jack In The Box exclusives. High-energy pieces for dancers and hype collectors.",
    accentGradient: "from-orange-500 via-red-500 to-yellow-400",
    soloHighlight: "Jack In The Box",
    shopBadge: "Hope Collection",
  },
  {
    id: "jimin",
    name: "Park Jimin",
    stageName: "Jimin",
    color: "#ffd93d",
    heroImage: memberHeroImage("jimin"),
    portraitImage: memberPortraitImage("jimin"),
    tagline: "FACE · Like Crazy · MUSE",
    bio: "FACE and MUSE-era apparel, scent, and cards — focused on current solo drops, not older tropes.",
    accentGradient: "from-amber-200 via-yellow-400 to-orange-300",
    soloHighlight: "FACE",
    shopBadge: "FACE / MUSE Line",
  },
  {
    id: "v",
    name: "Kim Taehyung",
    stageName: "V",
    color: "#2ed573",
    heroImage: memberHeroImage("v"),
    portraitImage: memberPortraitImage("v"),
    tagline: "Layover · Fri(end)s · Winter Ahead",
    bio: "Layover jazz packaging plus later single merch — coats, vinyl goods, and quiet studio pieces.",
    accentGradient: "from-emerald-800 via-teal-700 to-stone-600",
    soloHighlight: "Layover",
    shopBadge: "Layover Edit",
  },
  {
    id: "jungkook",
    name: "Jeon Jungkook",
    stageName: "Jungkook",
    color: "#5352ed",
    heroImage: memberHeroImage("jungkook"),
    portraitImage: memberPortraitImage("jungkook"),
    tagline: "GOLDEN · Seven · 3D",
    bio: "GOLDEN-era performance wear, album packs, and Seven / 3D single merch in one shop.",
    accentGradient: "from-yellow-500 via-amber-600 to-indigo-700",
    soloHighlight: "GOLDEN",
    shopBadge: "GOLDEN Edit",
  },
];

export const members: Member[] = [
  ...shopMembers,
  {
    id: "ot7",
    name: "All Members",
    stageName: "OT7",
    color: "#9d4edd",
    heroImage: memberHeroImage("ot7"),
    portraitImage: memberPortraitImage("ot7"),
    tagline: "Bangtan Sonyeondan · Seven as One",
    bio: "Group releases, OT7 photocards, and era-spanning collectibles for the complete ARMY.",
    accentGradient: "from-purple-deep via-purple-main to-purple-glow",
    soloHighlight: "Proof",
    shopBadge: "Full Group",
  },
];

export const SHOP_MEMBER_IDS: ShopMemberId[] = [
  "rm",
  "jin",
  "suga",
  "jhope",
  "jimin",
  "v",
  "jungkook",
];

export function getMember(id: string) {
  return members.find((m) => m.id === id);
}

export function getShopMember(id: string): ShopMember | undefined {
  return shopMembers.find((m) => m.id === id);
}

export function getMemberName(id: string) {
  return getMember(id)?.stageName ?? id;
}

export function isShopMember(id: string): id is ShopMemberId {
  return SHOP_MEMBER_IDS.includes(id as ShopMemberId);
}
