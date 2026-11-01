import Link from "next/link";
import Image from "next/image";
import { HeroSection, SectionHeader } from "@/components/home/hero";
import { EraTimeline } from "@/components/home/era-timeline";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { getFeaturedProducts, getGrailProducts, getTicketProducts, products } from "@/data/products";
import { getOpenExperiences } from "@/data/experiences";
import { getUpcomingConcerts } from "@/data/concerts";
import { ShopByMemberSection } from "@/components/members/member-cross-sell";
import { InviteArmyBanner } from "@/components/invite/invite-army";
import { Sparkles, BookOpen, Heart, Users, MapPin } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getProductPrice } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const featured = getFeaturedProducts(12);
  const grails = getGrailProducts(4);
  const tickets = getTicketProducts();
  const openEvents = getOpenExperiences().slice(0, 4);
  const nextShows = getUpcomingConcerts(3);
  const scentOfWeek =
    products.find((p) => p.id === "incense-arirang") ||
    products.find((p) => p.type === "fragrance" && p.inStock);
  const membership = products.find((p) => p.id === "army-membership-kit");

  return (
    <>
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ShopByMemberSection />

        <div className="py-10">
          <InviteArmyBanner />
        </div>

        {nextShows.length > 0 && (
          <section className="py-10">
            <SectionHeader
              title="On Tour — ARIRANG"
              subtitle="Next stadium dates on the world tour"
              href="/concerts"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {nextShows.map((c) => (
                <Link
                  key={c.id}
                  href={`/box-office/${c.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={c.image || "/concerts/arirang-hero.jpg"}
                      alt={`${c.city} concert`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <Badge variant={c.status === "onsale" ? "success" : "purple"}>
                        {c.status}
                      </Badge>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="font-display text-xl font-bold text-cream">{c.city}</p>
                      <p className="text-sm text-cream/60">{c.country}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-purple-glow">
                        <MapPin className="h-3.5 w-3.5" />
                        {formatDate(c.date)} · {c.venue}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(scentOfWeek || membership) && (
          <section className="grid gap-6 py-10 md:grid-cols-2">
            {scentOfWeek && (
              <Link
                href={`/products/${scentOfWeek.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-purple-light/20"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={scentOfWeek.image}
                    alt={scentOfWeek.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="text-xs font-semibold tracking-widest text-purple-glow uppercase">
                      Scent of the week
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-bold text-cream group-hover:text-purple-glow">
                      {scentOfWeek.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-cream/55">{scentOfWeek.description}</p>
                    <p className="mt-4 text-lg font-bold text-cream">
                      {formatPrice(getProductPrice(scentOfWeek))}
                    </p>
                  </div>
                </div>
              </Link>
            )}
            {membership && (
              <Link
                href={`/products/${membership.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-gold/20"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={membership.image}
                    alt={membership.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                      Membership
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-bold text-cream group-hover:text-gold">
                      {membership.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-cream/55">{membership.description}</p>
                    <p className="mt-4 text-lg font-bold text-cream">
                      {formatPrice(getProductPrice(membership))}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </section>
        )}

        <section className="py-16">
          <SectionHeader
            title="New Drops"
            subtitle="Albums, apparel, scents, cards, and tour exclusives"
            href="/explore"
          />
          <ProductGrid products={featured} />
        </section>

        {tickets.length > 0 && (
          <section className="py-16">
            <SectionHeader
              title="Choose a seat"
              subtitle="Front, middle, and back roll on every remaining show — or grab a pack from the catalog"
              href="/box-office"
              linkLabel="Box office"
            />
            <ProductGrid products={tickets} />
          </section>
        )}

        <EraTimeline />

        <section className="py-16">
          <SectionHeader
            title="Grails & Rare Finds"
            subtitle="Autographs, sealed debuts, and signed collectibles"
            href="/explore?rarity=out-of-print"
          />
          <ProductGrid products={grails} />
        </section>

        <section className="py-16">
          <SectionHeader
            title="Open Experiences"
            subtitle="Online & in-person meet & greet — apply now"
            href="/experiences"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {openEvents.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Users className="h-6 w-6 text-purple-glow" />}
            title="Member Shops"
            description="Seven private boutiques — clothes, scent, jewelry, cards, and M&G for each member."
            href="/members"
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-purple-glow" />}
            title="Deep Research"
            description="Timeline views, era completion tracking, and authenticity guides for every item."
            href="/research"
          />
          <FeatureCard
            icon={<Heart className="h-6 w-6 text-purple-glow" />}
            title="Personal Vault"
            description="Track your collection value, missing pieces, and grail wishlist."
            href="/vault"
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-purple-glow" />}
            title="ARIRANG Tour"
            description="Full world-tour calendar with merch and meet & greet links."
            href="/concerts"
          />
        </section>
      </div>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-purple-light/30"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-cream">{title}</h3>
      <p className="mt-2 text-sm text-cream/50">{description}</p>
    </Link>
  );
}
