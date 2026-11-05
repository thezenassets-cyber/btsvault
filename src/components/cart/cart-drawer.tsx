"use client";

import { CatalogPhoto } from "@/components/catalog/catalog-photo";
import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartLineKey, lineUnitPrice, useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ShopMemberId } from "@/lib/types";
import { isShopMember } from "@/data/members";
import { getProductById } from "@/data/products";
import { admitCode } from "@/data/seating";
import { SuperUpgrades } from "@/components/vault/super-upgrades";
import { tuckPaymentChat } from "@/lib/support/tawk-checkout";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    groupedItems,
    grandTotal,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearMemberCart,
  } = useCart();

  useEffect(() => {
    if (isOpen) tuckPaymentChat();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60"
        onClick={closeCart}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-[70] flex h-dvh w-full flex-col border-l border-white/10 bg-charcoal-soft shadow-2xl sm:max-w-md"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-purple-glow" />
            <h2 className="text-lg font-semibold text-cream">Your Cart</h2>
            <span className="rounded-full bg-purple-main/30 px-2 py-0.5 text-xs text-purple-glow">
              {itemCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-cream/60 hover:bg-white/5 hover:text-cream"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {groupedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-cream/20" />
              <p className="text-cream/60">Your cart is empty</p>
              <Link href="/members" onClick={closeCart} className="mt-4">
                <Button size="sm">Shop by Member</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedItems.map((group) => (
                <div key={group.memberId} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-cream">{group.label}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-glow">
                        {formatPrice(group.subtotal)}
                      </span>
                      {isShopMember(group.memberId) && (
                        <Link
                          href={`/members/${group.memberId}`}
                          onClick={closeCart}
                          className="text-xs text-cream/40 hover:text-purple-glow"
                        >
                          Complete set
                        </Link>
                      )}
                      <button
                        onClick={() =>
                          clearMemberCart(group.memberId as ShopMemberId | "ot7" | "box-office")
                        }
                        className="text-xs text-red-400/60 hover:text-red-400"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {group.items.map((cartItem) => {
                      const product = cartItem.seat ? null : getProductById(cartItem.productId);
                      if (!product && !cartItem.seat) return null;
                      const price = lineUnitPrice(cartItem);
                      const key = cartLineKey(cartItem);
                      const title = cartItem.seat
                        ? `${cartItem.seat.city} · ${cartItem.seat.sectionId} ${cartItem.seat.sectionLabel}`
                        : product!.name;
                      const image = cartItem.seat?.image || product!.image;
                      const code = cartItem.seat
                        ? admitCode(
                            cartItem.seat.concertId,
                            cartItem.seat.sectionId,
                            cartItem.seat.row,
                            cartItem.seat.seat
                          )
                        : null;
                      const detail = cartItem.seat
                        ? `${cartItem.seat.rollLabel} · Row ${cartItem.seat.row} · Seat ${cartItem.seat.seat}`
                        : null;
                      return (
                        <li key={key} className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-charcoal">
                            <CatalogPhoto
                              slug={product?.slug}
                              src={image}
                              alt={title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            {code && (
                              <p className="font-mono text-[10px] tracking-wide text-gold">{code}</p>
                            )}
                            <p className="line-clamp-2 text-xs font-medium text-cream">{title}</p>
                            {detail && <p className="mt-0.5 text-[11px] text-cream/45">{detail}</p>}
                            {cartItem.seat?.privateAccess && (
                              <p className="text-[11px] text-gold">{cartItem.seat.privateAccess.title}</p>
                            )}
                            <p className="mt-1 text-sm font-semibold text-cream">{formatPrice(price)}</p>
                            <div className="mt-2 flex items-center gap-2">
                              {!cartItem.seat && (
                                <>
                                  <button
                                    onClick={() => updateQuantity(key, cartItem.quantity - 1)}
                                    className="rounded border border-white/10 p-1 text-cream/60 hover:text-cream"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm text-cream">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(key, cartItem.quantity + 1)}
                                    className="rounded border border-white/10 p-1 text-cream/60 hover:text-cream"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => removeFromCart(key)}
                                className="ml-auto text-cream/40 hover:text-red-400"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {groupedItems.length > 0 && (
          <div className="border-t border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-cream/60">Grand Total</span>
              <span className="text-xl font-bold text-cream">{formatPrice(grandTotal)}</span>
            </div>
            <SuperUpgrades compact />
            <Link href="/checkout" onClick={closeCart} className="mt-4 block">
              <Button className="w-full">Pay in chat · {formatPrice(grandTotal)}</Button>
            </Link>
            <Link href="/members" onClick={closeCart}>
              <Button variant="outline" className="mt-2 w-full">
                Shop More Members
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-cream/40">
              Invite a friend to complete a member set together.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
