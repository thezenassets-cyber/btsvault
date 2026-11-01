import Image from "next/image";
import type { ShopMember } from "@/lib/types";
import { getMemberShopStats } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function MemberHero({ member }: { member: ShopMember }) {
  const stats = getMemberShopStats(member.id);

  return (
    <section className="relative min-h-[420px] overflow-hidden sm:min-h-[480px]">
      <div className={`absolute inset-0 bg-gradient-to-br ${member.accentGradient} opacity-40`} />
      <Image
        src={member.heroImage}
        alt={`${member.stageName} collection`}
        fill
        className="object-cover opacity-50"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />

      {/* ARMY Vault watermark */}
      <div className="pointer-events-none absolute right-8 top-8 hidden opacity-10 sm:block">
        <div className="flex items-center gap-2 text-6xl font-bold tracking-tighter text-white">
          <Sparkles className="h-12 w-12" />
          AV
        </div>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-6 lg:flex-row lg:items-end lg:gap-12 lg:px-8">
        <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/20 lg:mx-0 lg:h-44 lg:w-44">
          <Image
            src={member.portraitImage}
            alt={member.stageName}
            fill
            className="object-cover"
            priority
            sizes="176px"
          />
        </div>
        <div className="mt-6 flex-1 lg:mt-0">
          <Badge variant="purple">{member.shopBadge}</Badge>
          <p className="mt-3 text-sm font-medium tracking-widest text-purple-glow uppercase">
            {member.tagline}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-cream sm:text-5xl lg:text-6xl">
            {member.stageName}
            <span className="text-gradient-purple"> Shop</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cream/70">{member.bio}</p>
          {stats && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-cream">
                <strong className="text-purple-glow">{stats.totalItems}</strong> items
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-cream">
                From <strong className="text-purple-glow">{formatPrice(stats.minPrice)}</strong>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-cream">
                <strong className="text-green-400">{stats.inStockCount}</strong> in stock
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-cream">
                Solo: <strong>{member.soloHighlight}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
