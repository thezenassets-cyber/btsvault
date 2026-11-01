const fs = require("fs");
const path = require("path");

const ROOT = "d:/BTS";
const roots = [
  "src/data/albums.ts",
  "src/data/album-expansion.ts",
  "src/data/official-merch.ts",
  "src/data/member-boutique.ts",
];

const slugs = new Set();
const byKind = {};

function inferKind(slug) {
  if (/album|lp|weverse|anthology|persona|tear|her|essential|young-forever|indigo|happy|echo|dday|jack|face|layover|golden|arirang|proof|wings|butter|dynamite|skool|dark|o-rul8|2-cool|muse|rpwp|astronaut|hope-world|street|friends|winter|3d-single|seven-single|permission|answer|map-of-the-soul|ynwa|mixtape|single-pack|single-album/.test(slug))
    return "album";
  if (/light-stick|lightstick/.test(slug)) return "lightstick";
  if (/membership|army-card|photocard|merch-pack/.test(slug)) return "card";
  if (/incense|parfum|eau|mist|fragrance|citrus|musk|solar|jazz|smoke|rose/.test(slug))
    return "scent";
  if (/ring|earring|bracelet|chain|pendant|jewelry|septet|stud|band|pearl|titanium|camera/.test(slug))
    return "jewelry";
  if (/hoodie|tee|bomber|coat|jacket|cap|beanie|scarf|cargo|apparel|track/.test(slug))
    return "apparel";
  if (/meet|fan-sign|fansign|fan-meeting|vip|pass|ticket|online-meet|online-fansign/.test(slug))
    return "experience";
  if (/signed|autograph|poster|polaroid|booklet|art-print|vinyl-sleeve/.test(slug))
    return "autograph";
  return "merch";
}

for (const f of roots) {
  const t = fs.readFileSync(path.join(ROOT, f), "utf8");
  const re = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(t))) {
    slugs.add(m[1]);
    const k = inferKind(m[1]);
    byKind[k] = byKind[k] || [];
    byKind[k].push(m[1]);
  }
}

const prodDir = path.join(ROOT, "public/products");
const existing = new Set(
  fs.readdirSync(prodDir).filter((f) => f.endsWith(".jpg")).map((f) => f.replace(/\.jpg$/, ""))
);

const missing = [...slugs].filter((s) => !existing.has(s)).sort();
const tiny = [];
for (const s of [...slugs]) {
  const p = path.join(prodDir, s + ".jpg");
  if (!fs.existsSync(p)) continue;
  const st = fs.statSync(p);
  if (st.size < 8000) tiny.push({ slug: s, size: st.size });
}

console.log(JSON.stringify({
  slugCount: slugs.size,
  jpgCount: existing.size,
  missingCount: missing.length,
  missing,
  tinyCount: tiny.length,
  tiny: tiny.slice(0, 40),
  byKindCounts: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.length])),
  experiences: fs.readdirSync(path.join(ROOT, "public/experiences")),
  concerts: fs.readdirSync(path.join(ROOT, "public/concerts")),
}, null, 2));

fs.writeFileSync(
  path.join(ROOT, "scripts/missing-image-report.json"),
  JSON.stringify({ missing, byKind, all: [...slugs].sort() }, null, 2)
);
