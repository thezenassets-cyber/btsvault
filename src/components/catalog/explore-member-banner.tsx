"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isShopMember, getShopMember } from "@/data/members";
import type { ShopMemberId } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export function ExploreMemberBanner() {
  const searchParams = useSearchParams();
  const memberParam = searchParams.get("member");

  if (!memberParam || memberParam === "all" || memberParam === "ot7") return null;
  if (!isShopMember(memberParam)) return null;

  const member = getShopMember(memberParam as ShopMemberId);
  if (!member) return null;

  return (
    <Link
      href={`/members/${memberParam}`}
      className="mb-8 flex items-center justify-between rounded-2xl border border-purple-main/30 bg-purple-main/10 px-6 py-4 transition-colors hover:border-purple-light/50"
    >
      <div>
        <p className="text-sm text-cream/60">Browsing {member.stageName} items</p>
        <p className="font-semibold text-cream">
          View {member.stageName}&apos;s full private shop
        </p>
      </div>
      <ArrowRight className="h-5 w-5 text-purple-glow" />
    </Link>
  );
}
