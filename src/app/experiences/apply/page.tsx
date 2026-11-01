"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, User } from "lucide-react";
import { experiences } from "@/data/experiences";
import { members } from "@/data/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ExperienceFormat, MemberId } from "@/lib/types";
import { saveApplication } from "@/lib/applications";

function ApplyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventSlug = searchParams.get("event") ?? experiences.find((e) => e.status === "open")?.slug;
  const selectedEvent = experiences.find((e) => e.slug === eventSlug);

  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<ExperienceFormat | "">(
    selectedEvent?.format ?? ""
  );
  const [member, setMember] = useState<MemberId | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const eligibleMembers = members.filter(
    (m) => m.id !== "ot7" && selectedEvent?.eligibleMembers.includes(m.id)
  );

  const openByFormat = (f: ExperienceFormat) =>
    experiences.filter((e) => e.status === "open" && e.format === f);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    if (!selectedEvent || !member || !format) return;
    saveApplication({
      eventSlug: selectedEvent.slug,
      eventTitle: selectedEvent.title,
      memberId: member,
      format,
      fullName: name,
      email,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-green-400" />
        <h2 className="text-2xl font-bold text-cream">Application Submitted</h2>
        <p className="mt-3 max-w-md text-cream/60">
          Your application for {selectedEvent?.title} with{" "}
          {members.find((m) => m.id === member)?.stageName} has been received. You&apos;ll get an
          email when an admin reviews your application.
        </p>
        <Badge variant="purple" className="mt-4">
          Status: Pending review
        </Badge>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/experiences">
            <Button variant="secondary">View All Events</Button>
          </Link>
          <Link href="/">
            <Button>Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <div className="mb-10 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                s <= step ? "bg-purple-main text-white" : "bg-white/10 text-cream/40"
              }`}
            >
              {s}
            </div>
            {s < 4 && <div className={`h-0.5 w-8 ${s < step ? "bg-purple-main" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-cream">Choose Format</h2>
          <p className="text-sm text-cream/50">Online video slots or in-person stadium/city meets.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  id: "online" as const,
                  title: "Online",
                  blurb: "Video call / virtual M&G — $59–$149 listing band",
                },
                {
                  id: "in-person" as const,
                  title: "In Person",
                  blurb: "Stadium & city worldwide — $450–$2,500 listing band",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setFormat(opt.id);
                  const first = openByFormat(opt.id)[0];
                  if (first) router.push(`/experiences/apply?event=${first.slug}`);
                }}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  format === opt.id
                    ? "border-purple-light/50 bg-purple-main/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Badge variant={opt.id === "online" ? "purple" : "success"}>{opt.title}</Badge>
                <p className="mt-3 font-medium text-cream">{opt.title} Experience</p>
                <p className="mt-1 text-sm text-cream/50">{opt.blurb}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-cream">Select Event</h2>
          <div className="space-y-3">
            {experiences
              .filter((e) => e.status === "open" && (!format || e.format === format))
              .map((exp) => (
                <label
                  key={exp.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors ${
                    eventSlug === exp.slug
                      ? "border-purple-light/50 bg-purple-main/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="event"
                    checked={eventSlug === exp.slug}
                    onChange={() => {
                      setFormat(exp.format);
                      router.push(`/experiences/apply?event=${exp.slug}`);
                    }}
                    className="mt-1 accent-purple-main"
                  />
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant={exp.format === "online" ? "purple" : "success"}>
                        {exp.format === "online" ? "ONLINE" : "IN PERSON"}
                      </Badge>
                      <Badge variant="success">Open</Badge>
                    </div>
                    <p className="font-medium text-cream">{exp.title}</p>
                    <p className="mt-1 text-sm text-cream/50">{exp.description.slice(0, 120)}...</p>
                  </div>
                </label>
              ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-cream">Choose Your Member</h2>
          <p className="text-sm text-cream/50">Select the member you wish to meet at this event.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {eligibleMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMember(m.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                  member === m.id
                    ? "border-purple-light glow-purple bg-purple-main/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/10">
                  <Image
                    src={m.portraitImage}
                    alt={m.stageName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <span className="text-sm font-medium text-cream">{m.stageName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-cream">Your Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-cream/60">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your legal name" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-cream/60">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
              />
            </div>
          </div>

          {selectedEvent && (
            <div className="rounded-2xl glass p-5">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant={selectedEvent.format === "online" ? "purple" : "success"}>
                  {selectedEvent.format === "online" ? "ONLINE" : "IN PERSON"}
                </Badge>
              </div>
              <p className="text-sm font-medium text-cream">Requirements</p>
              <ul className="mt-3 space-y-2">
                {selectedEvent.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-cream/60">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-purple-glow" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm text-cream/60">
            <input type="checkbox" required className="mt-1 accent-purple-main" />
            I agree to the event terms, NDA, and no-recording policy.
          </label>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="submit"
          disabled={
            (step === 1 && !format) ||
            (step === 2 && !selectedEvent) ||
            (step === 3 && !member)
          }
        >
          {step === 4 ? "Submit Application" : "Continue"}
        </Button>
      </div>
    </form>
  );
}

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/experiences"
        className="mb-8 inline-flex items-center gap-2 text-sm text-cream/50 hover:text-purple-glow"
      >
        <ArrowLeft className="h-4 w-4" /> Back to experiences
      </Link>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-cream sm:text-4xl">Apply for Experience</h1>
        <p className="mt-2 text-cream/50">Four steps — format, event, member, details</p>
      </div>

      <Suspense fallback={<div className="text-center text-cream/50">Loading...</div>}>
        <ApplyForm />
      </Suspense>
    </div>
  );
}
