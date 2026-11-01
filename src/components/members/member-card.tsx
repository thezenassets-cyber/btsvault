import Image from "next/image";
import Link from "next/link";
import type { ShopMember } from "@/lib/types";
import type { ShopMemberId } from "@/lib/types";
import { getMemberShopStats } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface MemberCardProps {
  member: ShopMember;
  variant?: "grid" | "compact";
}

export function MemberCard({ member, variant = "grid" }: MemberCardProps) {
  const stats = getMemberShopStats(member.id);

  if (variant === "compact") {
    return (
      <Link
        href={`/members/${member.id}`}
        className="group flex shrink-0 flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-purple-light/40 hover:glow-purple w-[140px]"
      >
        <div
          className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/10 transition-all group-hover:ring-purple-light/50"
          style={{ boxShadow: `0 0 24px ${member.color}33` }}
        >
          <Image
            src={member.portraitImage}
            alt={member.stageName}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-cream group-hover:text-purple-glow">
          {member.stageName}
        </p>
        <p className="text-xs text-cream/40">from {formatPrice(stats.minPrice)}</p>
      </Link>
    );
  }

  return (
    <Link
      href={`/members/${member.id}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-charcoal-soft transition-all hover:border-purple-light/30 hover:glow-purple"
    >
      <div className={`relative h-48 bg-gradient-to-br ${member.accentGradient}`}>
        <Image
          src={member.portraitImage}
          alt={member.stageName}
          fill
          className="object-cover opacity-90 mix-blend-luminosity transition-all group-hover:mix-blend-normal group-hover:opacity-100"
          sizes="400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
        <Badge variant="purple" className="absolute left-4 top-4">
          {member.shopBadge}
        </Badge>
      </div>
      <div className="p-5">
        <p className="text-xs tracking-wider text-purple-glow uppercase">{member.tagline}</p>
        <h3 className="mt-1 text-xl font-bold text-cream group-hover:text-purple-glow">
          {member.stageName}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-cream/50">{member.bio}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-cream/40">
            {stats.totalItems} items · from {formatPrice(stats.minPrice)}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-purple-glow">
            Enter shop <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
