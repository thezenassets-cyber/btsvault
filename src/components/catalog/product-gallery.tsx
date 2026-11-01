"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { PriceTaggedImage } from "@/components/catalog/price-tagged-image";
import { cn } from "@/lib/utils";

export function ProductGallery({ product, eraStripClass }: { product: Product; eraStripClass?: string }) {
  const shots = [product.image, ...(product.gallery ?? [])];
  const [active, setActive] = useState(0);
  const activeSrc = shots[active] ?? product.image;
  const viewProduct = { ...product, image: activeSrc };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl">
        <PriceTaggedImage
          product={viewProduct}
          className="aspect-[4/5] sm:aspect-square"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {eraStripClass && (
          <div className={`absolute top-0 right-0 left-0 z-10 h-1.5 ${eraStripClass}`} />
        )}
      </div>
      {shots.length > 1 && (
        <div className="flex gap-2">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-lg border transition-colors",
                i === active ? "border-purple-glow" : "border-white/10 hover:border-white/30"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
