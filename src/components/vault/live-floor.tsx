"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { superUpgrades } from "@/data/upgrades";
import { getProductById } from "@/data/products";
import { getProductPrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

const drops = superUpgrades
  .map((upgrade) => {
    const product = getProductById(upgrade.productId);
    if (!product) return null;
    return { ...upgrade, name: product.name, price: getProductPrice(product) };
  })
  .filter((drop): drop is NonNullable<typeof drop> => Boolean(drop));

export function LiveFloor() {
  const pathname = usePathname();
  const { addToCart, grandTotal, ready } = useCart();
  const [spot, setSpot] = useState(0);
  const [shown, setShown] = useState(0);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (drops.length < 2) return;
    const timer = window.setInterval(() => {
      setSpot((index) => (index + 1) % drops.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const from = shown;
    const to = grandTotal;
    if (from === to) return;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 420);
      setShown(Math.round((from + (to - from) * t) * 100) / 100);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    setBump((n) => n + 1);
    return () => cancelAnimationFrame(frame);
  }, [grandTotal, ready]);

  if (pathname.startsWith("/admin") || drops.length === 0) return null;

  return (
    <div className="sticky top-[4.5rem] z-40 border-b border-gold/20 bg-charcoal">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <p className="hidden shrink-0 text-[10px] font-semibold tracking-widest text-gold uppercase sm:block">
          Floor open
        </p>
        <div className="scroll-row flex min-w-0 flex-1 gap-2">
          {drops.map((drop, index) => (
            <button
              key={drop.productId}
              type="button"
              onClick={() => addToCart(drop.productId, 1, undefined, { open: pathname !== "/checkout" })}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                index === spot ? "border-gold bg-gold/15 text-cream" : "border-white/10 text-cream/70"
              }`}
            >
              {drop.kicker} · {formatPrice(drop.price)}
            </button>
          ))}
        </div>
        <Link
          href="/checkout"
          className={`shrink-0 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-charcoal ${
            bump ? "scale-105" : ""
          }`}
          key={bump}
        >
          {grandTotal > 0 ? formatPrice(shown > 0 ? shown : grandTotal) : "Checkout"}
        </Link>
      </div>
    </div>
  );
}
