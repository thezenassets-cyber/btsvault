"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShopMember, MemberShopTab, ShopMemberId } from "@/lib/types";
import {
  filterMemberProducts,
  getMemberFeatured,
  getMemberShopStats,
  getMemberStarterBundle,
  getProductPrice,
  memberShopTabs,
} from "@/lib/catalog";
import { MemberHero } from "@/components/members/member-hero";
import { MemberCompletion } from "@/components/members/member-completion";
import { MemberCrossSell } from "@/components/members/member-cross-sell";
import { MemberProductCard } from "@/components/members/member-product-card";
import { AddToCartButton, AddBundleToCartButton } from "@/components/catalog/product-actions";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag } from "lucide-react";

export function MemberShopLayout({ member }: { member: ShopMember }) {
  const memberId = member.id;
  const [tab, setTab] = useState<MemberShopTab>("all");
  const stats = getMemberShopStats(memberId);
  const featured = getMemberFeatured(memberId, 3);
  const products = filterMemberProducts(memberId, tab);
  const bundle = getMemberStarterBundle(memberId);
  const bundleTotal = bundle.reduce((sum, p) => sum + getProductPrice(p), 0);

  return (
    <>
      <MemberHero member={member} />

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-10 sm:px-6 sm:pb-10 lg:px-8">
        {/* Value strip */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatPill label="Catalog Items" value={String(stats.totalItems)} />
          <StatPill label="In Stock" value={String(stats.inStockCount)} />
          <StatPill label="Price Range" value={`${formatPrice(stats.minPrice)} – ${formatPrice(stats.maxPrice)}`} />
          <StatPill label="Catalog Value" value={formatPrice(stats.estimatedCatalogValue)} />
        </div>

        <MemberCompletion memberId={memberId} />

        {/* Featured + bundle */}
        {featured.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-cream">Featured Picks</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {featured.map((product) => (
                <MemberProductCard key={product.id} product={product} memberId={memberId} />
              ))}
            </div>
          </section>
        )}

        {bundle.length >= 2 && (
          <section className="mt-8 rounded-2xl border border-purple-main/30 bg-purple-main/10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Package className="mt-1 h-5 w-5 text-purple-glow" />
                <div>
                  <h3 className="font-semibold text-cream">{member.stageName} Starter Pack</h3>
                  <p className="text-sm text-cream/60">
                    {bundle.length} essential items · {formatPrice(bundleTotal)} total
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <AddBundleToCartButton products={bundle} />
                {bundle.slice(0, 3).map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`}>
                    <Button size="sm" variant="outline">
                      {p.name.split("—")[0].trim().slice(0, 18)}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabs + grid */}
        <section className="mt-12">
          <div className="mb-6 flex flex-wrap gap-2">
            {memberShopTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "bg-purple-main text-white"
                    : "bg-white/5 text-cream/60 hover:bg-white/10 hover:text-cream"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {products.length === 0 ? (
            <p className="py-12 text-center text-cream/50">No items in this category.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <MemberProductCard key={product.id} product={product} memberId={memberId} />
              ))}
            </div>
          )}
        </section>

        <MemberCrossSell currentMemberId={memberId} />
      </div>

      {/* Mobile sticky CTA */}
      {featured[0] && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-charcoal p-4 sm:hidden">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 shrink-0 text-purple-glow" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-cream">{featured[0].name}</p>
              <p className="text-xs text-purple-glow">{formatPrice(getProductPrice(featured[0]))}</p>
            </div>
            <AddToCartButton product={featured[0]} size="sm" />
          </div>
        </div>
      )}
    </>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-cream/40">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-cream">{value}</p>
    </div>
  );
}
