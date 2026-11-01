import Link from "next/link";
import { ConcertsCalendar } from "@/components/concerts/concerts-calendar";
import { concerts } from "@/data/concerts";
import { Button } from "@/components/ui/button";

export default function ConcertsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-purple-glow uppercase">
            World Tour
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-cream">ARIRANG Calendar</h1>
          <p className="mt-2 max-w-xl text-cream/55">
            {concerts.length} stadium dates across Asia, the Americas, Europe, and Oceania. Upcoming
            nights open the stage chart so you can choose a seat.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/box-office">
            <Button>Find seats</Button>
          </Link>
          <Link href="/explore?q=arirang">
            <Button variant="secondary">Tour merch</Button>
          </Link>
          <Link href="/experiences">
            <Button>Experiences</Button>
          </Link>
        </div>
      </div>

      <ConcertsCalendar />
    </div>
  );
}
