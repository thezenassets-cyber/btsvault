import Link from "next/link";
import { BtsLogo } from "@/components/brand/bts-logo";
import { STORE_PROMISE, WORLDWIDE_ACTIVE_USERS } from "@/lib/promise";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-charcoal-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <BtsLogo size="footer" />
              <span className="font-bold leading-none text-cream">ARMY Vault</span>
            </div>
            <p className="mt-4 font-display text-sm font-bold text-cream">{WORLDWIDE_ACTIVE_USERS}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/50">
              Discover, collect, and celebrate every era of BTS merchandise. From debut treasures
              to the latest drops — your purple archive starts here. Borahae.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/50">
              <li><Link href="/box-office" className="hover:text-purple-glow">Box Office</Link></li>
              <li><Link href="/members" className="hover:text-purple-glow">Member Shops</Link></li>
              <li><Link href="/explore" className="hover:text-purple-glow">Browse All</Link></li>
              <li><Link href="/explore?era=proof" className="hover:text-purple-glow">Proof Era</Link></li>
              <li><Link href="/explore?rarity=out-of-print" className="hover:text-purple-glow">Grails</Link></li>
              <li><Link href="/vault" className="hover:text-purple-glow">My Collection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-cream">Experiences</h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/50">
              <li><Link href="/experiences" className="hover:text-purple-glow">All Events</Link></li>
              <li><Link href="/experiences/apply" className="hover:text-purple-glow">Apply Now</Link></li>
              <li><Link href="/research" className="hover:text-purple-glow">Research Hub</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start gap-3 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-cream/40">{STORE_PROMISE}</p>
          <p className="shrink-0 text-xs text-purple-glow/60">Purple you</p>
        </div>
      </div>
    </footer>
  );
}
