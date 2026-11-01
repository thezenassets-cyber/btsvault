import Link from "next/link";
import Image from "next/image";
import { getSellableConcerts } from "@/data/concerts";
import { LOWEST_SEAT_PRICE } from "@/data/seating";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { STORE_PROMISE } from "@/lib/promise";

export const metadata = {
  title: "Box Office — ARMY Vault",
  description: "Choose your seat for every remaining ARIRANG show. Front, middle, and back roll.",
};

export default function BoxOfficePage() {
  const shows = getSellableConcerts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.28em] text-purple-glow uppercase">Box office</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-cream sm:text-5xl">Pick your seat</h1>
      <p className="mt-3 max-w-2xl text-cream/60">
        Every remaining ARIRANG night uses the same stage chart. Front roll from the barricade,
        middle roll in the lower bowl, back roll upstairs. From {formatPrice(LOWEST_SEAT_PRICE)}.
      </p>
      <p className="mt-3 text-sm text-cream/40">
        {STORE_PROMISE}
      </p>

      <ul className="mt-10 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10">
        {shows.map((show) => (
          <li key={show.id} className="flex flex-col gap-4 bg-white/[0.03] p-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-full overflow-hidden rounded-2xl sm:h-16 sm:w-28 sm:shrink-0">
              <Image
                src={show.image || "/concerts/arirang-hero.jpg"}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs tracking-wide text-purple-glow uppercase">
                {formatDate(show.date)} · {show.country}
              </p>
              <p className="font-display text-xl font-bold text-cream">{show.city}</p>
              <p className="text-sm text-cream/50">{show.venue}</p>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <p className="text-sm text-cream/70">
                from <span className="font-semibold text-cream">{formatPrice(LOWEST_SEAT_PRICE)}</span>
              </p>
              <Link href={`/box-office/${show.id}`}>
                <Button size="sm">Find seats</Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
