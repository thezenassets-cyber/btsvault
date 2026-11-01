"use client";

import { Suspense } from "react";
import { ExploreFilters, useExploreFilters } from "@/components/catalog/explore-filters";
import { ExploreMemberBanner } from "@/components/catalog/explore-member-banner";
import { ProductGrid } from "@/components/catalog/product-grid";

function ExploreContent() {
  const { products } = useExploreFilters();

  return (
    <>
      <ExploreMemberBanner />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ExploreFilters />
        <ProductGrid products={products} emptyMessage="No items match your filters. Try broadening your search." />
      </div>
    </>
  );
}

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-cream sm:text-4xl">Explore Catalog</h1>
        <p className="mt-2 text-cream/50">
          Search across every era, member, and merchandise type
        </p>
      </div>

      <Suspense fallback={<div className="text-cream/50">Loading catalog...</div>}>
        <ExploreContent />
      </Suspense>
    </div>
  );
}
