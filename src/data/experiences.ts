import type { Experience } from "@/lib/types";

export const experiences: Experience[] = [
  {
    id: "exp-online-mg-2026",
    slug: "online-meet-greet-2026",
    title: "Online Meet & Greet — Global 2026",
    description:
      "Virtual video meet & greet with your chosen member. Selected applicants receive a timed online slot from anywhere in the world.",
    type: "meet-greet",
    status: "open",
    format: "online",
    opensAt: "2026-03-01",
    closesAt: "2026-06-30",
    eligibleMembers: ["rm", "jin", "suga", "jhope", "jimin", "v", "jungkook"],
    maxApplicants: 80000,
    currentApplicants: 18420,
    image: "/experiences/online-meet.jpg",
    requirements: [
      "Must be 16+ with parental consent if under 18",
      "Stable internet (minimum 10 Mbps)",
      "One application per person",
      "Quiet private space for the call",
    ],
  },
  {
    id: "exp-online-fansign-2026",
    slug: "online-fan-sign-2026",
    title: "Online Fan-Sign — Spring 2026",
    description:
      "Virtual signing slot. Winners join a livestreamed fan-sign and receive a digitally authenticated signed album insert.",
    type: "fan-sign",
    status: "open",
    format: "online",
    opensAt: "2026-03-15",
    closesAt: "2026-05-15",
    eligibleMembers: ["rm", "jin", "suga", "jhope", "jimin", "v", "jungkook"],
    maxApplicants: 100000,
    currentApplicants: 22100,
    image: "/experiences/online-fansign.jpg",
    requirements: [
      "Weverse or ARMY Vault account in good standing",
      "Proof of qualifying album purchase",
      "Timezone availability during scheduled blocks",
    ],
  },
  {
    id: "exp-inperson-mg-arirang",
    slug: "arirang-in-person-meet-greet",
    title: "ARIRANG In-Person Meet & Greet",
    description:
      "Stadium/city meet & greet tied to the ARIRANG World Tour. Selected fans receive a timed on-site greeting with their chosen member.",
    type: "meet-greet",
    status: "open",
    format: "in-person",
    opensAt: "2026-04-01",
    closesAt: "2026-08-31",
    eligibleMembers: ["rm", "jin", "suga", "jhope", "jimin", "v", "jungkook"],
    maxApplicants: 25000,
    currentApplicants: 9800,
    city: "Goyang",
    concertId: "arirang-goyang-2026-04-09",
    image: "/experiences/inperson-meet.jpg",
    requirements: [
      "Must be 18+ or accompanied by legal guardian",
      "Valid government ID at check-in",
      "Travel to selected tour city at applicant's expense",
      "Agreement to NDA and no-recording policy",
    ],
  },
  {
    id: "exp-inperson-fansign-2026",
    slug: "global-fan-signing-spring-2026",
    title: "In-Person Fan Signing — Tour Cities 2026",
    description:
      "Apply for an on-site fan signing at ARIRANG tour stops. Selected applicants receive a timed slot, signed album, and photo opportunity.",
    type: "fan-sign",
    status: "open",
    format: "in-person",
    opensAt: "2026-03-01",
    closesAt: "2026-04-15",
    eligibleMembers: ["rm", "jin", "suga", "jhope", "jimin", "v", "jungkook"],
    maxApplicants: 50000,
    currentApplicants: 12480,
    image: "/experiences/inperson-fansign.jpg",
    requirements: [
      "Must be 18+ or accompanied by legal guardian",
      "Valid government ID required at check-in",
      "One application per person per event",
      "Proof of album purchase from authorized retailer",
      "Agreement to NDA and no-recording policy",
    ],
  },
  {
    id: "exp-hi-touch-2026",
    slug: "hi-touch-experience-2026",
    title: "Hi-Touch Experience 2026",
    description:
      "Brief one-on-one handshake and greeting with your selected member. Faster format than fan sign — ideal for international ARMY attending showcase events.",
    type: "hi-touch",
    status: "open",
    format: "in-person",
    opensAt: "2026-02-15",
    closesAt: "2026-03-30",
    eligibleMembers: ["rm", "jin", "suga", "jhope", "jimin", "v", "jungkook"],
    maxApplicants: 30000,
    currentApplicants: 8920,
    image: "/experiences/hi-touch.jpg",
    requirements: [
      "Must be 16+ with parental consent if under 18",
      "Event wristband non-transferable",
      "Single member selection per application",
      "Health screening may be required",
    ],
  },
  {
    id: "exp-video-call",
    slug: "weverse-video-call-event",
    title: "Weverse Video Call Lottery",
    description:
      "Virtual meet experience via official video call platform. Winners receive a 2-minute private call with their chosen member. Global participation available.",
    type: "video-call",
    status: "upcoming",
    format: "online",
    opensAt: "2026-05-01",
    closesAt: "2026-05-20",
    eligibleMembers: ["rm", "jin", "suga", "jhope", "jimin", "v", "jungkook"],
    maxApplicants: 100000,
    currentApplicants: 0,
    image: "/experiences/video-call.jpg",
    requirements: [
      "Weverse account in good standing",
      "Stable internet connection (minimum 10 Mbps)",
      "Purchase of qualifying album within event window",
      "Timezone availability during scheduled call blocks",
    ],
  },
  {
    id: "exp-fan-meeting",
    slug: "army-fan-meeting-2026",
    title: "ARMY Fan Meeting 2026 — OT7 VIP",
    description:
      "Group fan meeting with all seven members. Interactive segments, Q&A, and group photo. Lottery-based selection with regional quotas.",
    type: "fan-meeting",
    status: "upcoming",
    format: "in-person",
    opensAt: "2026-09-01",
    closesAt: "2026-10-15",
    eligibleMembers: ["ot7"],
    maxApplicants: 20000,
    currentApplicants: 4200,
    image: "/experiences/ot7-fanmeet.jpg",
    requirements: [
      "Must be 18+",
      "Fan club membership verification",
      "Single application per household",
      "Travel and accommodation at applicant's expense",
    ],
  },
];

export function getExperienceBySlug(slug: string) {
  return experiences.find((e) => e.slug === slug);
}

export function getOpenExperiences() {
  return experiences.filter((e) => e.status === "open");
}

export function getUpcomingExperiences() {
  return experiences.filter((e) => e.status === "upcoming");
}
