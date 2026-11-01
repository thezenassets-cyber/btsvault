import Link from "next/link";
import Image from "next/image";
import { eras } from "@/data/eras";
import { getProductsByEra } from "@/data/products";

export function EraTimeline() {
  return (
    <section className="py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cream sm:text-3xl">Browse by Era</h2>
        <p className="mt-2 text-cream/50">Travel through every chapter of the BTS journey</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {eras.map((era) => {
          const count = getProductsByEra(era.id).length;
          return (
            <Link
              key={era.id}
              href={`/explore?era=${era.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 transition-all hover:border-purple-light/30"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={`/eras/${era.id}.jpg`}
                  alt={era.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
                <div className={`absolute left-0 right-0 top-0 h-1.5 ${era.stripClass}`} />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-medium tracking-wider text-cream/60 uppercase">
                    {era.years}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-cream group-hover:text-purple-glow">
                    {era.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-cream/55">{era.description}</p>
                  <p className="mt-3 text-xs text-purple-glow/80">{count} items catalogued</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
