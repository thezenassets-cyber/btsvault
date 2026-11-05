"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { CatalogPhoto } from "@/components/catalog/catalog-photo";
import { superUpgrades } from "@/data/upgrades";
import { getProductById } from "@/data/products";
import { getProductPrice } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/catalog";

const KICKER: Record<string, MessageKey> = {
  "lightstick-ver4": "up.lightstick",
  "army-membership-kit": "up.card",
  "ticket-soundcheck": "up.early",
  "ticket-ga-1": "up.getin",
  "ticket-vip-1": "up.move",
  "ticket-vip-bulk-2": "up.bring",
  "ticket-bulk-8": "up.row",
  "incense-arirang": "up.home",
};

export function SuperUpgrades({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { addToCart, items } = useCart();
  const { t } = useI18n();
  const drops = superUpgrades
    .map((upgrade) => {
      const product = getProductById(upgrade.productId);
      if (!product) return null;
      const quantity = items
        .filter((item) => item.productId === product.id && !item.seat)
        .reduce((sum, item) => sum + item.quantity, 0);
      return { ...upgrade, product, price: getProductPrice(product), quantity };
    })
    .filter((drop): drop is NonNullable<typeof drop> => Boolean(drop));

  if (drops.length === 0) return null;

  return (
    <section className={compact ? "" : "py-10"}>
      {!compact && (
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold text-cream sm:text-3xl">{t("up.heading")}</h2>
          <p className="mt-2 text-cream/55">{t("up.lead")}</p>
        </div>
      )}
      <div className={compact ? "scroll-row flex gap-2 pb-1" : "grid grid-cols-2 gap-3 lg:grid-cols-4"}>
        {drops.map((drop) => (
          <button
            key={drop.productId}
            type="button"
            onClick={() => addToCart(drop.productId, 1, undefined, { open: pathname !== "/checkout" })}
            className={
              compact
                ? "shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-2 text-left text-xs text-cream"
                : "min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-gold/50"
            }
          >
            {!compact && (
              <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-charcoal">
                <CatalogPhoto
                  slug={drop.product.slug}
                  src={drop.product.image}
                  alt={drop.product.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
            )}
            <p className="text-[10px] font-semibold tracking-widest text-gold uppercase">{KICKER[drop.productId] ? t(KICKER[drop.productId]) : drop.kicker}</p>
            <p className={`font-medium text-cream ${compact ? "max-w-40 truncate" : "mt-1 line-clamp-2 text-sm"}`}>
              {drop.product.name}
            </p>
            {!compact && <p className="mt-1 line-clamp-2 text-xs text-cream/45">{drop.line}</p>}
            <p className="mt-2 flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-cream">{formatPrice(drop.price)}</span>
              <span className="text-gold">{drop.quantity > 0 ? `${t("up.onCard")} ×${drop.quantity}` : t("up.add")}</span>
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
