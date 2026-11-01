import Link from "next/link";
import type { Product, ShopMemberId } from "@/lib/types";
import { getMember } from "@/data/members";
import { formatPrice } from "@/lib/utils";
import { getProductPrice } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/catalog/product-actions";
import { PriceTaggedImage } from "@/components/catalog/price-tagged-image";

interface MemberProductCardProps {
  product: Product;
  memberId: ShopMemberId;
}

export function MemberProductCard({ product, memberId }: MemberProductCardProps) {
  const member = getMember(memberId);
  const price = getProductPrice(product);

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:glow-purple"
      style={{ borderColor: `${member?.color}33` }}
    >
      <Link href={`/products/${product.slug}`}>
        <PriceTaggedImage
          product={product}
          className="aspect-square"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
          sizes="300px"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.experienceFormat && (
          <div className="mb-2">
            <Badge variant={product.experienceFormat === "online" ? "purple" : "success"}>
              {product.experienceFormat === "online" ? "ONLINE" : "IN PERSON"}
            </Badge>
          </div>
        )}
        {product.scentNotes && product.scentNotes.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {product.scentNotes.slice(0, 3).map((note) => (
              <span
                key={note}
                className="rounded-full bg-gradient-to-r from-purple-main/30 to-purple-glow/20 px-2 py-0.5 text-[10px] text-purple-glow"
              >
                {note}
              </span>
            ))}
          </div>
        )}
        {product.inclusionCount && (
          <p className="mb-1 text-xs text-cream/40">{product.inclusionCount} inclusions</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-cream group-hover:text-purple-glow">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-cream">{formatPrice(price)}</span>
          {product.listingPrice && product.msrp !== price && (
            <span className="text-xs text-cream/40 line-through">{formatPrice(product.msrp)}</span>
          )}
        </div>
        {product.type === "army-card" && (
          <div className="mt-1">
            <Badge variant="purple">ARMY Card</Badge>
          </div>
        )}
        <div className="mt-auto pt-3">
          <AddToCartButton product={product} size="sm" className="w-full" />
        </div>
      </div>
    </div>
  );
}
