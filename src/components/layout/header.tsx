"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { BtsLogo } from "@/components/brand/bts-logo";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { InviteArmyButton } from "@/components/invite/invite-army";
import { ClientCard } from "@/components/client-card/client-card";
import { useI18n } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/catalog";

const navLinks: { href: string; key: MessageKey }[] = [
  { href: "/explore", key: "nav.merch" },
  { href: "/box-office", key: "nav.box" },
  { href: "/members", key: "nav.members" },
  { href: "/concerts", key: "nav.concerts" },
  { href: "/vault", key: "nav.vault" },
  { href: "/experiences", key: "nav.experiences" },
  { href: "/research", key: "nav.research" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, closeCart, itemCount } = useCart();
  const { t } = useI18n();

  function onMenuClick() {
    setMobileOpen((open) => {
      if (open) return false;
      closeCart();
      return true;
    });
  }

  function onCartClick() {
    setMobileOpen(false);
    toggleCart();
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-charcoal">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <BtsLogo priority />
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-bold tracking-tight text-cream sm:text-base">
                ARMY Vault
              </span>
              <span className="mt-0.5 hidden truncate text-[11px] leading-none text-purple-glow md:block">
                Borahae Collection
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-purple-main/20 text-purple-glow"
                    : "text-cream/70 hover:bg-white/5 hover:text-cream"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <Link href="/vault" className="hidden lg:inline-flex" aria-label={t("nav.card")}>
              <ClientCard size="chip" />
            </Link>
            <div className="hidden 2xl:block">
              <InviteArmyButton />
            </div>
            <Link
              href="/explore"
              className="hidden rounded-full p-2 text-cream/70 transition-colors hover:bg-white/5 hover:text-cream lg:flex"
              aria-label={t("nav.search")}
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/vault"
              className="rounded-full p-2 text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
              aria-label={t("nav.vault")}
            >
              <Heart className="h-5 w-5" />
            </Link>
            <button
              onClick={onCartClick}
              className="relative rounded-full p-2 text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
              aria-label={t("nav.cart")}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-main px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
            <button
              className="rounded-full p-2 text-cream/70 xl:hidden"
              onClick={onMenuClick}
              aria-label={t("nav.menu")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/5 px-4 py-4 xl:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-3 text-sm font-medium",
                  pathname.startsWith(link.href)
                    ? "bg-purple-main/20 text-purple-glow"
                    : "text-cream/70"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
