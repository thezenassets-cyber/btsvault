import type { Era } from "@/lib/types";

export const eras: Era[] = [
  {
    id: "2c4s",
    name: "2 Cool 4 Skool",
    years: "2013",
    description: "Debut era — raw hip-hop beginnings",
    stripClass: "era-strip-proof",
  },
  {
    id: "hyyh",
    name: "HYYH",
    years: "2015–2016",
    description: "The Most Beautiful Moment in Life universe",
    stripClass: "era-strip-hyyh",
  },
  {
    id: "wings",
    name: "Wings",
    years: "2016–2017",
    description: "Individual short films and artistic evolution",
    stripClass: "era-strip-mots",
  },
  {
    id: "ly",
    name: "Love Yourself",
    years: "2017–2018",
    description: "Global breakthrough and self-love trilogy",
    stripClass: "era-strip-ly",
  },
  {
    id: "mots",
    name: "Map of the Soul",
    years: "2019–2020",
    description: "Jungian psychology and persona exploration",
    stripClass: "era-strip-mots",
  },
  {
    id: "be",
    name: "BE",
    years: "2020",
    description: "Intimate reflection during uncertain times",
    stripClass: "era-strip-be",
  },
  {
    id: "proof",
    name: "Proof",
    years: "2022",
    description: "Anthology celebrating nine years of BTS",
    stripClass: "era-strip-proof",
  },
  {
    id: "solo",
    name: "Solo Projects",
    years: "2022–",
    description: "Individual member albums and collaborations",
    stripClass: "era-strip-proof",
  },
];

export function getEra(id: string) {
  return eras.find((e) => e.id === id);
}

export function getEraName(id: string) {
  return getEra(id)?.name ?? id;
}
