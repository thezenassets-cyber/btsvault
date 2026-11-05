"use client";

import Link from "next/link";
import { BtsLogo } from "@/components/brand/bts-logo";
import { useI18n } from "@/lib/i18n/provider";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-white/5 bg-charcoal-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <BtsLogo size="footer" />
              <span className="font-bold leading-none text-cream">ARMY Vault</span>
            </div>
            <p className="mt-4 font-display text-sm font-bold text-cream">{t("foot.users")}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/50">{t("foot.blurb")}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream">{t("foot.shop")}</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/50">
              <li><Link href="/box-office" className="hover:text-purple-glow">{t("foot.box")}</Link></li>
              <li><Link href="/members" className="hover:text-purple-glow">{t("foot.members")}</Link></li>
              <li><Link href="/explore" className="hover:text-purple-glow">{t("foot.browse")}</Link></li>
              <li><Link href="/explore?era=proof" className="hover:text-purple-glow">{t("foot.proof")}</Link></li>
              <li><Link href="/explore?rarity=out-of-print" className="hover:text-purple-glow">{t("foot.grails")}</Link></li>
              <li><Link href="/vault" className="hover:text-purple-glow">{t("foot.collection")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream">{t("foot.experiences")}</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/50">
              <li><Link href="/experiences" className="hover:text-purple-glow">{t("foot.events")}</Link></li>
              <li><Link href="/experiences/apply" className="hover:text-purple-glow">{t("foot.apply")}</Link></li>
              <li><Link href="/research" className="hover:text-purple-glow">{t("foot.research")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-cream/40">{t("foot.promise")}</p>
          <p className="shrink-0 text-xs text-purple-glow/60">{t("foot.signoff")}</p>
        </div>
      </div>
    </footer>
  );
}
