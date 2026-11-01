"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { shopMembers } from "@/data/members";
import { ClientCard } from "@/components/client-card/client-card";
import { WORLDWIDE_ACTIVE_USERS } from "@/lib/promise";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/explore?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-deep/45 via-charcoal to-charcoal" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <ClientCard size="hero" editable />
        <div>
        <p className="mb-3 font-display text-sm font-semibold tracking-[0.25em] text-purple-glow uppercase">
          ARMY Vault
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Present the card.{" "}
          <span className="text-gradient-purple">Buy the drop. Pick the seat.</span>
        </h1>
        <p className="mt-4 font-display text-base font-bold text-cream">{WORLDWIDE_ACTIVE_USERS}</p>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream/60">
          The Client Card is how you shop. Merch, membership, and a seat in the front, middle, or
          back roll for every remaining ARIRANG show.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/explore">
            <Button size="lg">Shop merch</Button>
          </Link>
          <Link href="/box-office">
            <Button size="lg" variant="outline">Choose a seat</Button>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrance, jewelry, ARMY cards..."
              className="py-3 pl-11"
            />
          </div>
          <Button type="submit" size="lg">
            Explore Catalog
          </Button>
        </form>

        <div className="scroll-row mt-10 flex gap-3 pb-2">
          {shopMembers.map((m, i) => (
            <Link
              key={m.id}
              href={`/members/${m.id}`}
              className="group relative shrink-0 overflow-hidden rounded-2xl border border-white/10 transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative h-28 w-24 sm:h-36 sm:w-28">
                <Image
                  src={m.portraitImage}
                  alt={m.stageName}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="112px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
                <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-semibold text-cream">
                  {m.stageName}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { label: "Fragrance", q: "type=fragrance" },
            { label: "Jewelry", q: "type=jewelry" },
            { label: "Seats", q: "" },
            { label: "Meet & Greet", q: "type=experience" },
            { label: "Autographs", q: "type=autograph" },
          ].map((tag) => (
            <Link
              key={tag.label}
              href={tag.label === "Seats" ? "/box-office" : `/explore?${tag.q}`}
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-cream/60 transition-colors hover:border-purple-light/40 hover:text-purple-glow"
            >
              {tag.label}
            </Link>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-cream/50">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-glow hover:text-purple-light"
        >
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
