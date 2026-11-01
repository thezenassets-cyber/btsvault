import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Shield, Layers } from "lucide-react";
import { eras } from "@/data/eras";
import { products } from "@/data/products";
import { Badge } from "@/components/ui/badge";

const guides = [
  {
    title: "Starter Kit for New ARMY",
    description:
      "Essential albums and merch to begin your collection — Proof Standard, MOTS:7, and an ARMY Bomb.",
    era: "proof",
    items: ["proof-standard", "mots7-album", "lightstick-ver4"],
  },
  {
    title: "HYYH Universe Collector's Path",
    description:
      "Complete the Most Beautiful Moment in Life storyline with albums and era goods.",
    era: "hyyh",
    items: ["hyyh-yf", "skool-luv", "dark-wild"],
  },
  {
    title: "Identifying Authentic Photocards",
    description:
      "Learn texture, weight, and printing cues to distinguish official photocards from reproductions.",
    era: "mots",
    items: ["mots-persona", "proof-weverse"],
  },
  {
    title: "Solo Era Collection Guide",
    description:
      "Track each member's solo discography — RM's Indigo, Jimin's FACE, j-hope's Jack In The Box, and more.",
    era: "solo",
    items: ["rm-indigo", "jimin-face", "jhope-jitb"],
  },
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Badge variant="purple">Research Hub</Badge>
        <h1 className="mt-4 text-3xl font-bold text-cream sm:text-4xl">Deep Research</h1>
        <p className="mt-3 max-w-2xl text-cream/50">
          Guides, timelines, and authenticity resources to help ARMY discover both new releases and
          vintage treasures across every era.
        </p>
      </div>

      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Layers className="h-5 w-5" />} label="Items Catalogued" value={products.length.toString()} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Eras Covered" value={eras.length.toString()} />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Guides" value={guides.length.toString()} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="Auth Notes" value="12+" />
      </div>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-cream">Era Timeline</h2>
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-purple-main/30 sm:left-1/2" />
          <div className="space-y-8">
            {eras.map((era, i) => {
              const count = products.filter((p) => p.era === era.id).length;
              return (
                <div
                  key={era.id}
                  className={`relative flex items-center gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "sm:text-right" : ""}`}>
                    <Link
                      href={`/explore?era=${era.id}`}
                      className="inline-block rounded-2xl glass p-5 transition-colors hover:border-purple-light/30"
                    >
                      <p className="text-xs text-cream/40 uppercase">{era.years}</p>
                      <h3 className="mt-1 font-semibold text-cream">{era.name}</h3>
                      <p className="mt-2 text-sm text-cream/50">{era.description}</p>
                      <p className="mt-2 text-xs text-purple-glow">{count} items →</p>
                    </Link>
                  </div>
                  <div className="absolute left-4 h-3 w-3 -translate-x-1/2 rounded-full bg-purple-main sm:left-1/2" />
                  <div className="hidden flex-1 sm:block" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-cream">Collector Guides</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => {
            const era = eras.find((e) => e.id === guide.era);
            const cover =
              guide.items
                .map((id) => products.find((p) => p.id === id))
                .find(Boolean)?.image ?? `/eras/${guide.era}.jpg`;
            return (
              <div key={guide.title} className="overflow-hidden rounded-2xl border border-white/10">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={cover}
                    alt={guide.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                  {era && <div className={`absolute left-0 right-0 top-0 h-1.5 ${era.stripClass}`} />}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-lg font-semibold text-cream">{guide.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-cream/60">{guide.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {guide.items.map((id) => {
                        const product = products.find((p) => p.id === id);
                        if (!product) return null;
                        return (
                          <Link key={id} href={`/products/${product.slug}`}>
                            <Badge variant="default" className="cursor-pointer hover:bg-purple-main/20">
                              {product.name.split("—")[0].trim().slice(0, 30)}
                            </Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="mb-3 text-purple-glow">{icon}</div>
      <p className="text-2xl font-bold text-cream">{value}</p>
      <p className="text-sm text-cream/50">{label}</p>
    </div>
  );
}
