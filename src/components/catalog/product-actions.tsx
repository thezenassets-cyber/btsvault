"use client";

import { useState } from "react";
import { useVault } from "@/components/vault/vault-context";
import { useCart } from "@/components/cart/cart-context";
import type { ApparelSize, Product } from "@/lib/types";
import { getProductPrice } from "@/lib/catalog";
import { ticketBulkOptions } from "@/data/tickets";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export function ProductActions({ product }: { product: Product }) {
  const { hasItem, addItem, removeItem } = useVault();
  const { addToCart } = useCart();
  const inVault = hasItem(product.id);
  const [cartAdded, setCartAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<ApparelSize | undefined>(product.sizeOptions?.[2]);
  const isTicket =
    product.tags.includes("ticket") || product.tags.includes("bulk-ready");
  const unit = getProductPrice(product);

  function handleAddToCart(quantity = qty) {
    addToCart(product.id, quantity, size);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {product.sizeOptions && product.sizeOptions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wider text-cream/50 uppercase">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-10 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  size === s
                    ? "border-purple-glow bg-purple-main/40 text-cream"
                    : "border-white/15 text-cream/60 hover:border-purple-light/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium tracking-wider text-cream/50 uppercase">
          Quantity
        </p>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-white/15">
            <button
              type="button"
              className="p-2 text-cream/70 hover:text-cream"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold text-cream">{qty}</span>
            <button
              type="button"
              className="p-2 text-cream/70 hover:text-cream"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-cream/50">
            {formatPrice(unit * qty)} total
          </span>
        </div>
      </div>

      {isTicket && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wider text-cream/50 uppercase">
            Buy in bulk
          </p>
          <div className="flex flex-wrap gap-2">
            {ticketBulkOptions.map((opt) => (
              <button
                key={opt.qty}
                type="button"
                onClick={() => {
                  setQty(opt.qty);
                  handleAddToCart(opt.qty);
                }}
                disabled={!product.inStock}
                className="rounded-full border border-purple-light/30 bg-purple-main/15 px-3 py-1.5 text-xs font-medium text-purple-glow transition-colors hover:bg-purple-main/30 disabled:opacity-40"
              >
                {opt.label} · {formatPrice(unit * opt.qty)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className={cn("flex-1 transition-all", cartAdded && "bg-green-600 hover:bg-green-600")}
          disabled={!product.inStock}
          onClick={() => handleAddToCart()}
        >
          {cartAdded ? (
            <>
              <Check className="h-4 w-4" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {product.inStock
                ? `Add ${qty > 1 ? `${qty} ` : ""}to Cart`
                : "Notify When Available"}
            </>
          )}
        </Button>
        <Button
          size="lg"
          variant={inVault ? "primary" : "outline"}
          onClick={() => (inVault ? removeItem(product.id) : addItem(product.id))}
        >
          <Heart className={cn("h-4 w-4", inVault && "fill-current")} />
          {inVault ? "In Vault" : "Add to Vault"}
        </Button>
      </div>
    </div>
  );
}

export function AddToCartButton({
  product,
  size = "md",
  className,
  quantity = 1,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
  quantity?: number;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      size={size}
      className={cn(className, added && "bg-green-600 hover:bg-green-600")}
      disabled={!product.inStock}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.id, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "Added" : "Add to Cart"}
    </Button>
  );
}

export function AddBundleToCartButton({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const ready = products.filter((p) => p.inStock);

  return (
    <Button
      size="sm"
      className={cn(className, added && "bg-green-600 hover:bg-green-600")}
      disabled={ready.length === 0}
      onClick={() => {
        ready.forEach((p) => addToCart(p.id, 1));
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {added ? "Pack added" : `Add all ${ready.length} to cart`}
    </Button>
  );
}
