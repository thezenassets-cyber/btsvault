"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { getProductPrice } from "@/lib/catalog";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PriceTaggedImageProps {
  product: Product;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  showRarity?: boolean;
}

function fallbackFor(type: Product["type"]) {
  const map: Partial<Record<Product["type"], string>> = {
    album: "/fallbacks/album.jpg",
    photobook: "/fallbacks/album.jpg",
    apparel: "/fallbacks/apparel.jpg",
    accessory: "/fallbacks/apparel.jpg",
    jewelry: "/fallbacks/jewelry.jpg",
    fragrance: "/fallbacks/fragrance.jpg",
    experience: "/fallbacks/experience.jpg",
    lightstick: "/fallbacks/lightstick.jpg",
    "army-card": "/fallbacks/army-card.jpg",
    membership: "/fallbacks/army-card.jpg",
    autograph: "/fallbacks/autograph.jpg",
    merch: "/fallbacks/merch.jpg",
    dvd: "/fallbacks/album.jpg",
    collab: "/fallbacks/merch.jpg",
  };
  return map[type] ?? "/fallbacks/default.jpg";
}

export function PriceTaggedImage({
  product,
  fill = true,
  width,
  height,
  priority,
  className,
  imageClassName,
  sizes = "(max-width: 640px) 100vw, 33vw",
  showRarity = true,
}: PriceTaggedImageProps) {
  const price = getProductPrice(product);
  const [src, setSrc] = useState(product.image || fallbackFor(product.type));

  useEffect(() => {
    setSrc(product.image || fallbackFor(product.type));
  }, [product.id, product.image, product.type]);

  return (
    <div className={cn("relative overflow-hidden bg-charcoal-soft", className)}>
      {fill ? (
        <Image
          key={src}
          src={src}
          alt={product.name}
          fill
          priority={priority}
          className={cn("object-cover", imageClassName)}
          sizes={sizes}
          unoptimized
          onError={() => setSrc(fallbackFor(product.type))}
        />
      ) : (
        <Image
          key={src}
          src={src}
          alt={product.name}
          width={width ?? 800}
          height={height ?? 800}
          priority={priority}
          className={cn("h-auto w-full object-cover", imageClassName)}
          unoptimized
          onError={() => setSrc(fallbackFor(product.type))}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent p-3 pt-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-charcoal px-3 py-1.5">
          <span className="text-sm font-bold tracking-wide text-cream">{formatPrice(price)}</span>
          {product.currency && (
            <span className="text-[10px] uppercase text-cream/50">{product.currency}</span>
          )}
        </div>
      </div>

      {showRarity && product.rarity !== "standard" && (
        <div className="absolute left-3 top-3">
          <Badge variant={product.rarity === "out-of-print" ? "gold" : "purple"}>
            {product.rarity.replace("-", " ")}
          </Badge>
        </div>
      )}

      {!product.inStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal/60">
          <Badge variant="muted">Sold Out</Badge>
        </div>
      )}
    </div>
  );
}
