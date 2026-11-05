import Link from "next/link";

export const bookLanes = [
  {
    id: "meet",
    title: "Meet & Greet",
    line: "Pick a member, a remaining night, and the access.",
    href: "/book?lane=meet",
  },
  {
    id: "reserve",
    title: "Reservation",
    line: "Hold GA or VIP seats for a party of up to 8.",
    href: "/book?lane=reserve",
  },
  {
    id: "vacation",
    title: "Vacation",
    line: "A city stay around one remaining show.",
    href: "/book?lane=vacation",
  },
] as const;

export function BookShortcuts({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="scroll-row flex gap-2">
        {bookLanes.map((lane) => (
          <Link
            key={lane.id}
            href={lane.href}
            className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-cream/80 uppercase"
          >
            {lane.title}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {bookLanes.map((lane) => (
        <Link
          key={lane.id}
          href={lane.href}
          className="rounded-2xl border border-gold/30 bg-white/5 p-5 transition hover:border-gold"
        >
          <p className="text-[10px] font-semibold tracking-widest text-gold uppercase">Book</p>
          <h2 className="mt-1 font-display text-xl font-bold text-cream">{lane.title}</h2>
          <p className="mt-2 text-sm text-cream/55">{lane.line}</p>
        </Link>
      ))}
    </div>
  );
}
