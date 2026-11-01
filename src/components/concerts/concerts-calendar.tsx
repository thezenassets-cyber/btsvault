"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { concerts, isSellableConcert } from "@/data/concerts";
import type { Concert } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const regions: { id: Concert["region"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "asia", label: "Asia" },
  { id: "americas", label: "Americas" },
  { id: "europe", label: "Europe" },
  { id: "oceania", label: "Oceania" },
];

const statusVariant = {
  past: "muted" as const,
  upcoming: "purple" as const,
  onsale: "success" as const,
};

export function ConcertsCalendar() {
  const [region, setRegion] = useState<Concert["region"] | "all">("all");
  const [monthKey, setMonthKey] = useState<string>("all");

  const months = useMemo(() => {
    const keys = Array.from(
      new Set(concerts.map((c) => c.date.slice(0, 7)))
    ).sort();
    return keys;
  }, []);

  const filtered = useMemo(() => {
    return concerts.filter((c) => {
      if (region !== "all" && c.region !== region) return false;
      if (monthKey !== "all" && !c.date.startsWith(monthKey)) return false;
      return true;
    });
  }, [region, monthKey]);

  const byMonth = useMemo(() => {
    const map = new Map<string, Concert[]>();
    for (const c of filtered) {
      const key = c.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRegion(r.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              region === r.id
                ? "bg-purple-main text-white"
                : "bg-white/5 text-cream/60 hover:bg-white/10"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMonthKey("all")}
          className={`rounded-lg px-3 py-1 text-xs ${
            monthKey === "all" ? "bg-purple-main/40 text-cream" : "text-cream/50 hover:text-cream"
          }`}
        >
          All months
        </button>
        {months.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMonthKey(m)}
            className={`rounded-lg px-3 py-1 text-xs ${
              monthKey === m ? "bg-purple-main/40 text-cream" : "text-cream/50 hover:text-cream"
            }`}
          >
            {new Date(m + "-01").toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </button>
        ))}
      </div>

      {byMonth.map(([key, list]) => (
        <section key={key}>
          <h2 className="mb-4 font-display text-xl font-bold text-cream">
            {new Date(key + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <ConcertCard key={c.id} concert={c} />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-cream/50">No shows for this filter.</p>
      )}
    </div>
  );
}

function ConcertCard({ concert }: { concert: Concert }) {
  const image = concert.image || "/concerts/arirang-hero.jpg";

  return (
    <article className="overflow-hidden rounded-2xl glass">
      <div className="relative aspect-[16/9] bg-purple-main/20">
        <Image
          src={image}
          alt={`${concert.city} — ARIRANG`}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant={statusVariant[concert.status]}>{concert.status}</Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display text-lg font-bold text-cream">{concert.city}</p>
          <p className="text-xs text-cream/70">{concert.country}</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-sm text-cream/60">
          <Calendar className="h-4 w-4 text-purple-glow" />
          {formatDate(concert.date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-cream/60">
          <MapPin className="h-4 w-4 text-purple-glow" />
          {concert.venue}
        </div>
        <div className="flex gap-2 pt-2">
          <Link href="/explore?q=arirang" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Tour merch
            </Button>
          </Link>
          {isSellableConcert(concert) ? (
            <Link href={`/box-office/${concert.id}`} className="flex-1">
              <Button size="sm" className="w-full">
                <Ticket className="h-3.5 w-3.5" /> Find seats
              </Button>
            </Link>
          ) : (
            <span className="flex flex-1 items-center justify-center text-xs text-cream/35">
              Show complete
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
