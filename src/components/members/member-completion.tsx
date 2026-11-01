"use client";

import Link from "next/link";
import type { ShopMemberId } from "@/lib/types";
import { useVault } from "@/components/vault/vault-context";
import { getMemberCompletion } from "@/lib/catalog";
import { getShopMember } from "@/data/members";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export function MemberCompletion({ memberId }: { memberId: ShopMemberId }) {
  const { ownedIds } = useVault();
  const completion = getMemberCompletion(ownedIds, memberId);
  const member = getShopMember(memberId);

  if (completion.total === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-semibold text-cream">Complete Your {member?.stageName} Set</h2>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-3xl font-bold text-purple-glow">{completion.percentage}%</span>
        <span className="text-sm text-cream/50">
          {completion.owned} of {completion.total} items in your vault
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-main to-purple-glow transition-all"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>
      {completion.missing.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-cream/50">
            {completion.missing.length} item{completion.missing.length !== 1 ? "s" : ""} still to
            collect
          </p>
          {completion.missing.slice(0, 1).map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`}>
              <Button size="sm" variant="outline">
                Shop next item
              </Button>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
