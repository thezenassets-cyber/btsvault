import Link from "next/link";
import Image from "next/image";
import type { ShopMemberId } from "@/lib/types";
import { shopMembers, getShopMember } from "@/data/members";
import { getMemberShopStats } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function MemberCrossSell({ currentMemberId }: { currentMemberId: ShopMemberId }) {
  const others = shopMembers
    .filter((m) => m.id !== currentMemberId)
    .slice(0, 3);

  return (
    <section className="py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cream">Collect the Whole Line</h2>
          <p className="mt-1 text-cream/50">Explore other member shops and fill your cart</p>
        </div>
        <Link
          href="/members"
          className="hidden items-center gap-1 text-sm text-purple-glow hover:text-purple-light sm:flex"
        >
          All members <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {others.map((member) => {
          const stats = getMemberShopStats(member.id);
          return (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-light/30"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={member.portraitImage}
                  alt={member.stageName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-cream group-hover:text-purple-glow">
                  {member.stageName}
                </p>
                <p className="text-xs text-cream/40">
                  {stats.totalItems} items · from {formatPrice(stats.minPrice)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-cream/30 group-hover:text-purple-glow" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function ShopByMemberSection() {
  return (
    <section className="py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cream sm:text-3xl">Shop by Member</h2>
        <p className="mt-2 text-cream/50">
          Each member has a private merchandise collection — browse, collect, and cart separately
        </p>
      </div>
      <div className="scroll-row -mx-4 flex gap-4 px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-7">
        {shopMembers.map((member) => (
          <MemberCrossSellCard key={member.id} memberId={member.id} />
        ))}
      </div>
    </section>
  );
}

function MemberCrossSellCard({ memberId }: { memberId: ShopMemberId }) {
  const member = getShopMember(memberId);
  if (!member) return null;
  const stats = getMemberShopStats(memberId);

  return (
    <Link
      href={`/members/${memberId}`}
      className="group relative flex w-40 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 sm:w-auto sm:shrink"
    >
      <div className={`relative h-32 bg-gradient-to-br ${member.accentGradient}`}>
        <Image
          src={member.portraitImage}
          alt={member.stageName}
          fill
          className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
          sizes="200px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent" />
      </div>
      <div className="bg-charcoal-soft p-3">
        <p className="font-semibold text-cream group-hover:text-purple-glow">{member.stageName}</p>
        <p className="text-xs text-cream/40">from {formatPrice(stats.minPrice)}</p>
      </div>
    </Link>
  );
}
