"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Calendar, Users, ArrowRight, MapPin } from "lucide-react";
import type { Experience } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusVariant = {
  open: "success" as const,
  upcoming: "purple" as const,
  closed: "muted" as const,
};

const typeLabels = {
  "fan-sign": "Fan Signing",
  "hi-touch": "Hi-Touch",
  "video-call": "Video Call",
  "fan-meeting": "Fan Meeting",
  "meet-greet": "Meet & Greet",
};

export function ExperienceCard({ experience }: { experience: Experience }) {
  const progress = (experience.currentApplicants / experience.maxApplicants) * 100;
  const [src, setSrc] = useState(experience.image ?? "/experiences/default.jpg");

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl glass">
      <div className="relative aspect-[16/9] overflow-hidden bg-purple-main/20">
        <Image
          src={src}
          alt={experience.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          onError={() => setSrc("/experiences/default.jpg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant={experience.format === "online" ? "purple" : "success"}>
            {experience.format === "online" ? "ONLINE" : "IN PERSON"}
          </Badge>
          <Badge variant={statusVariant[experience.status]}>{experience.status}</Badge>
        </div>
      </div>

      <div className="border-b border-white/5 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-cream">{experience.title}</h3>
          <Badge variant="default">{typeLabels[experience.type]}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm leading-relaxed text-cream/60">{experience.description}</p>

        <div className="mt-4 space-y-2 text-sm text-cream/50">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-glow" />
            <span>
              {formatDate(experience.opensAt)} — {formatDate(experience.closesAt)}
            </span>
          </div>
          {experience.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-glow" />
              <span>{experience.city}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-glow" />
            <span>
              {experience.currentApplicants.toLocaleString()} /{" "}
              {experience.maxApplicants.toLocaleString()} applicants
            </span>
          </div>
        </div>

        {experience.status === "open" && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-purple-main transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          {experience.status === "open" ? (
            <Link href={`/experiences/apply?event=${experience.slug}`}>
              <Button className="w-full">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : experience.status === "upcoming" ? (
            <Button variant="outline" className="w-full" disabled>
              Opens {formatDate(experience.opensAt)}
            </Button>
          ) : (
            <Button variant="secondary" className="w-full" disabled>
              Applications Closed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
