const fs = require("fs");
const raw = fs.readFileSync(
  "C:/Users/JACKTECH WORLD/.cursor/projects/d-BTS/agent-tools/8b0fe6bf-8811-4d50-b496-4879e754bcbc.txt",
  "utf8"
);

const months = {
  JANUARY: "01",
  FEBRUARY: "02",
  MARCH: "03",
  APRIL: "04",
  MAY: "05",
  JUNE: "06",
  JULY: "07",
  AUGUST: "08",
  SEPTEMBER: "09",
  OCTOBER: "10",
  NOVEMBER: "11",
  DECEMBER: "12",
};

const re =
  /^(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{1,2}),\s+(202[6-7])\s+(.+?)\s{2,}(.+)$/gm;

const countryMap = {
  GOYANG: ["South Korea", "asia"],
  TOKYO: ["Japan", "asia"],
  BUSAN: ["South Korea", "asia"],
  TAMPA: ["United States", "americas"],
  "EL PASO": ["United States", "americas"],
  "MEXICO CITY": ["Mexico", "americas"],
  STANFORD: ["United States", "americas"],
  "LAS VEGAS": ["United States", "americas"],
  MADRID: ["Spain", "europe"],
  BRUSSELS: ["Belgium", "europe"],
  LONDON: ["United Kingdom", "europe"],
  MUNICH: ["Germany", "europe"],
  PARIS: ["France", "europe"],
  "EAST RUTHERFORD": ["United States", "americas"],
  FOXBOROUGH: ["United States", "americas"],
  BALTIMORE: ["United States", "americas"],
  ARLINGTON: ["United States", "americas"],
  TORONTO: ["Canada", "americas"],
  CHICAGO: ["United States", "americas"],
  "LOS ANGELES": ["United States", "americas"],
  BOGOTA: ["Colombia", "americas"],
  LIMA: ["Peru", "americas"],
  SANTIAGO: ["Chile", "americas"],
  "BUENOS AIRES": ["Argentina", "americas"],
  "SAO PAULO": ["Brazil", "americas"],
  "SÃO PAULO": ["Brazil", "americas"],
  TAIPEI: ["Taiwan", "asia"],
  BANGKOK: ["Thailand", "asia"],
  "KUALA LUMPUR": ["Malaysia", "asia"],
  SINGAPORE: ["Singapore", "asia"],
  JAKARTA: ["Indonesia", "asia"],
  MELBOURNE: ["Australia", "oceania"],
  SYDNEY: ["Australia", "oceania"],
  "HONG KONG": ["Hong Kong", "asia"],
  BULACAN: ["Philippines", "asia"],
  MANILA: ["Philippines", "asia"],
  BOCAUE: ["Philippines", "asia"],
};

// Also match lines without double-space city/venue split
const lines = raw.split(/\r?\n/);
const concerts = [];
const seen = new Set();

for (const line of lines) {
  const m = line.trim().match(
    /^(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{1,2}),\s+(202[6-7])\s+(.+)$/i
  );
  if (!m) continue;
  const [, mon, day, year, rest] = m;
  // Skip historical pre-2026 non-ARIRANG if any mid file - we only want 2026-2027 and not 2025 aux
  if (year === "2025") continue;
  // rest is CITY VENUE in caps
  let city = null;
  let venue = null;
  let country = "Unknown";
  let region = "asia";
  const upper = rest.replace(/\s+Ticket.*$/i, "").replace(/\s+EVENT.*$/i, "").trim();
  const keys = Object.keys(countryMap).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (upper.startsWith(k + " ") || upper === k) {
      city = k
        .split(" ")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
      if (k === "LOS ANGELES") city = "Los Angeles";
      if (k === "EL PASO") city = "El Paso";
      if (k === "EAST RUTHERFORD") city = "East Rutherford";
      if (k === "LAS VEGAS") city = "Las Vegas";
      if (k === "MEXICO CITY") city = "Mexico City";
      if (k === "BUENOS AIRES") city = "Buenos Aires";
      if (k === "SAO PAULO" || k === "SÃO PAULO") city = "São Paulo";
      if (k === "KUALA LUMPUR") city = "Kuala Lumpur";
      if (k === "HONG KONG") city = "Hong Kong";
      [country, region] = countryMap[k];
      venue = upper.slice(k.length).trim();
      venue = venue
        .split(" ")
        .map((w) => {
          if (["M&T", "AT&T", "GNP", "US"].includes(w)) return w;
          return w.charAt(0) + w.slice(1).toLowerCase();
        })
        .join(" ")
        .replace(/\bStadium\b/i, "Stadium")
        .replace(/\bDome\b/i, "Dome")
        .replace(/\bArena\b/i, "Arena")
        .replace(/\bField\b/i, "Field");
      break;
    }
  }
  if (!city) continue;
  const date = `${year}-${months[mon.toUpperCase()]}-${String(day).padStart(2, "0")}`;
  const id = `arirang-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${date}`;
  if (seen.has(id)) continue;
  seen.add(id);
  const today = "2026-09-30";
  let status = "upcoming";
  if (date < today) status = "past";
  else if (date <= "2026-12-31") status = "onsale";
  concerts.push({ id, date, city, country, venue: venue || "TBA", region, status });
}

concerts.sort((a, b) => a.date.localeCompare(b.date));

const out = `import type { Concert } from "@/lib/types";

/** ARIRANG World Tour schedule (official Big Hit Music tour listing) */
export const concerts: Concert[] = [
${concerts
  .map(
    (c) => `  {
    id: ${JSON.stringify(c.id)},
    date: ${JSON.stringify(c.date)},
    city: ${JSON.stringify(c.city)},
    country: ${JSON.stringify(c.country)},
    venue: ${JSON.stringify(c.venue)},
    tourName: "ARIRANG",
    region: ${JSON.stringify(c.region)},
    status: ${JSON.stringify(c.status)},
    image: "/concerts/arirang-hero.jpg",
  }`
  )
  .join(",\n")}
];

export function getUpcomingConcerts(limit = 3) {
  const today = new Date().toISOString().slice(0, 10);
  return concerts.filter((c) => c.date >= today).slice(0, limit);
}

export function getConcertsByRegion(region: Concert["region"] | "all") {
  if (region === "all") return concerts;
  return concerts.filter((c) => c.region === region);
}

export function getConcertById(id: string) {
  return concerts.find((c) => c.id === id);
}
`;

fs.writeFileSync("d:/BTS/src/data/concerts.ts", out);
console.log("wrote", concerts.length, "concerts");
