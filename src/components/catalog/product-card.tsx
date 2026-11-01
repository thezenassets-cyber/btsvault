import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getEraName } from "@/data/eras";
import { getProductPrice } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { PriceTaggedImage } from "@/components/catalog/price-tagged-image";

interface ProductCardProps {
  product: Product;
  showVaultAction?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const price = getProductPrice(product);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:border-purple-light/30 hover:glow-purple"
    >
      <PriceTaggedImage
        product={product}
        className="aspect-square"
        imageClassName="transition-transform duration-500 group-hover:scale-105"
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="muted">{getEraName(product.era)}</Badge>
          <Badge variant="muted">{product.type}</Badge>
          {product.experienceFormat === "online" && <Badge variant="purple">ONLINE</Badge>}
          {product.experienceFormat === "in-person" && <Badge variant="success">IN PERSON</Badge>}
          {product.includesPhotocard && <Badge variant="purple">PC</Badge>}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-cream group-hover:text-purple-glow">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-cream">{formatPrice(price)}</span>
          {product.inStock ? (
            <span className="text-xs text-green-400">In Stock</span>
          ) : (
            <span className="text-xs text-cream/40">Resale only</span>
          )}
        </div>
      </div>
    </Link>
  );
}
