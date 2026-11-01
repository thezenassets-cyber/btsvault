/**
 * Original night-stadium posters for the box office.
 * No venue photography and no member likenesses.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const cities = [
  { slug: "kaohsiung", name: "Kaohsiung", venue: "Kaohsiung National Stadium", accent: "#c77dff" },
  { slug: "bangkok", name: "Bangkok", venue: "Rajamangala National Stadium", accent: "#e8b86d" },
  { slug: "kuala-lumpur", name: "Kuala Lumpur", venue: "TM Stadium Nasional", accent: "#7ec8c8" },
  { slug: "singapore", name: "Singapore", venue: "National Stadium", accent: "#9d4edd" },
  { slug: "jakarta", name: "Jakarta", venue: "Gelora Bung Karno", accent: "#f4a6b8" },
  { slug: "melbourne", name: "Melbourne", venue: "Marvel Stadium", accent: "#8ec5ff" },
  { slug: "sydney", name: "Sydney", venue: "Accor Stadium", accent: "#d4af37" },
  { slug: "hong-kong", name: "Hong Kong", venue: "Kai Tak Stadium", accent: "#ff6b9d" },
  { slug: "bulacan", name: "Bulacan", venue: "Philippine Sports Stadium", accent: "#c4b5fd" },
];

function posterSvg(city) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#12081c"/>
      <stop offset="45%" stop-color="#2a1248"/>
      <stop offset="100%" stop-color="#0c0c10"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="78%" r="42%">
      <stop offset="0%" stop-color="${city.accent}" stop-opacity="0.85"/>
      <stop offset="55%" stop-color="#7b2cbf" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#7b2cbf" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a3a44"/>
      <stop offset="100%" stop-color="#16161c"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#sky)"/>
  <rect width="1600" height="1000" fill="url(#glow)"/>
  <g opacity="0.35" stroke="${city.accent}" fill="none" stroke-width="2">
    <path d="M800 180 L1040 920"/>
    <path d="M800 180 L560 920"/>
    <path d="M800 180 L800 860"/>
  </g>
  <ellipse cx="800" cy="860" rx="620" ry="150" fill="#07070b"/>
  <ellipse cx="800" cy="820" rx="540" ry="120" fill="url(#bowl)"/>
  <ellipse cx="800" cy="800" rx="390" ry="78" fill="#101018"/>
  <ellipse cx="800" cy="790" rx="250" ry="46" fill="#1c1028"/>
  <rect x="560" y="760" width="480" height="36" rx="8" fill="${city.accent}"/>
  <text x="800" y="784" text-anchor="middle" fill="#1a1020" font-family="Segoe UI, sans-serif" font-size="18" font-weight="700" letter-spacing="8">STAGE</text>
  <g fill="${city.accent}" opacity="0.9">
    <circle cx="220" cy="140" r="2"/>
    <circle cx="280" cy="90" r="1.5"/>
    <circle cx="1340" cy="120" r="2"/>
    <circle cx="1180" cy="70" r="1.4"/>
    <circle cx="980" cy="60" r="1.6"/>
    <circle cx="420" cy="160" r="1.2"/>
  </g>
  <text x="96" y="150" fill="#c77dff" font-family="Segoe UI, sans-serif" font-size="22" font-weight="700" letter-spacing="6">ARIRANG WORLD TOUR</text>
  <text x="96" y="250" fill="#f8f7f4" font-family="Segoe UI, sans-serif" font-size="92" font-weight="800">${escapeXml(city.name)}</text>
  <text x="96" y="320" fill="#f8f7f4" font-family="Segoe UI, sans-serif" font-size="28" opacity="0.75">${escapeXml(city.venue)}</text>
  <text x="96" y="900" fill="#f8f7f4" font-family="Segoe UI, sans-serif" font-size="18" letter-spacing="4" opacity="0.55">ARMY VAULT BOX OFFICE</text>
</svg>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "concerts", "cities");
  fs.mkdirSync(outDir, { recursive: true });
  for (const city of cities) {
    const svg = Buffer.from(posterSvg(city));
    const file = path.join(outDir, `${city.slug}.jpg`);
    await sharp(svg).jpeg({ quality: 90 }).toFile(file);
    console.log("wrote", file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
