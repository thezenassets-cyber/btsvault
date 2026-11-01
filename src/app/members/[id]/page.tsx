import { notFound } from "next/navigation";
import { SHOP_MEMBER_IDS, getShopMember } from "@/data/members";
import { MemberShopLayout } from "@/components/members/member-shop-layout";
import type { ShopMemberId } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return SHOP_MEMBER_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const member = getShopMember(id);
  if (!member) return { title: "Member Shop — ARMY Vault" };
  return {
    title: `${member.stageName} Shop — ARMY Vault`,
    description: member.bio,
  };
}

export default async function MemberShopPage({ params }: PageProps) {
  const { id } = await params;
  if (!SHOP_MEMBER_IDS.includes(id as ShopMemberId)) notFound();

  const member = getShopMember(id);
  if (!member) notFound();

  return <MemberShopLayout member={member} />;
}
