"use client";

import { ExperienceCard } from "@/components/experiences/experience-card";
import { useI18n } from "@/lib/i18n/provider";
import { experiences } from "@/data/experiences";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ExperiencesPage() {
  const open = experiences.filter((e) => e.status === "open");
  const upcoming = experiences.filter((e) => e.status === "upcoming");
  const closed = experiences.filter((e) => e.status === "closed");
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cream sm:text-4xl">{t("exp.title")}</h1>
          <p className="mt-2 max-w-xl text-cream/50">{t("exp.lead")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/book">
            <Button size="lg">{t("exp.book")}</Button>
          </Link>
          <Link href="/experiences/apply">
            <Button size="lg" variant="secondary">
              {t("exp.apply")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {open.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-green-400">{t("exp.open")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {open.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-purple-glow">{t("exp.soon")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-semibold text-cream/40">{t("exp.closed")}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {closed.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
