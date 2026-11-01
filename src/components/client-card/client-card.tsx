"use client";

import { useState } from "react";
import { useClientCard } from "@/components/client-card/client-card-context";
import type { ClientTier } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIER_LABEL: Record<ClientTier, string> = {
  guest: "Guest",
  member: "Member",
  private: "Private Access",
};

export function ClientCard({
  size = "full",
  editable = false,
  className,
}: {
  size?: "hero" | "full" | "chip";
  editable?: boolean;
  className?: string;
}) {
  const { profile, tier, setHolderName } = useClientCard();
  const [draft, setDraft] = useState<string | null>(null);

  if (size === "chip") {
    return (
      <span
        className={cn(
          "hidden items-center gap-2 rounded-full border border-gold/30 bg-gradient-to-r from-[#2a2114] to-[#3a2a4a] px-3 py-1.5 md:inline-flex",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-gold" />
        <span className="max-w-[7rem] truncate text-xs font-semibold text-cream">
          {profile.holderName}
        </span>
        <span className="font-mono text-[10px] tracking-wider text-gold/80">
          {profile.number.slice(-4)}
        </span>
      </span>
    );
  }

  const compact = size === "hero";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-gold/30 shadow-2xl",
        "bg-gradient-to-br from-[#1c140c] via-[#3a2458] to-[#120c18]",
        compact ? "aspect-[1.7/1] w-full max-w-md" : "aspect-[1.7/1] w-full max-w-lg",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-purple-main/30 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.28em] text-gold uppercase">
              ARMY Vault
            </p>
            <p className="mt-1 font-display text-lg font-bold text-cream">Client Card</p>
          </div>
          <span className="rounded-full border border-gold/40 bg-black/30 px-3 py-1 text-[10px] font-semibold tracking-wider text-gold uppercase">
            {TIER_LABEL[tier]}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            {editable ? (
              <input
                aria-label="Card holder name"
                value={draft ?? profile.holderName}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  if (draft !== null) setHolderName(draft);
                  setDraft(null);
                }}
                className="w-full max-w-[14rem] border-b border-white/20 bg-transparent text-sm font-medium text-cream outline-none placeholder:text-cream/30"
              />
            ) : (
              <p className="truncate text-sm font-medium text-cream">{profile.holderName}</p>
            )}
            <p className="mt-2 font-mono text-sm tracking-[0.18em] text-cream/80 sm:text-base">
              {profile.number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-widest text-cream/40 uppercase">Code</p>
            <p className="font-mono text-sm text-gold">{profile.code}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
