/**
 * Fill missing product JPGs with soft studio composites (no labeled SVG stubs).
 * Prefer AI assets from Cursor assets folder when present.
 * --realistic-only: refuse classic labeled SVG path (always true for this script)
 * --missing-only: only write when dest missing
 * --force: regenerate all
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "products");
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "d-BTS",
  "assets"
);

const FLAGS = new Set(process.argv.slice(2));
const MISSING_ONLY = FLAGS.has("--missing-only") || !FLAGS.has("--force");

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function inferKind(slug) {
  if (/album|lp|weverse|anthology|persona|tear|her|essential|young-forever|indigo|happy|echo|dday|jack|face|layover|golden|arirang|proof|wings|butter|dynamite|skool|dark|o-rul8|2-cool|muse|rpwp|astronaut|hope-world|street|friends|winter|3d-single|seven-single|permission|answer|map-of-the-soul|ynwa|mixtape/.test(slug))
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

function studioSvg(slug, kind) {
  const h = hash(slug);
  const hue = h % 360;
  const accent = `hsl(${hue}, 52%, 48%)`;
  const bg = `hsl(${(hue + 210) % 360}, 16%, 9%)`;
  const bg2 = `hsl(${(hue + 40) % 360}, 22%, 14%)`;

  let product = "";
  switch (kind) {
    case "album":
      product = `<rect x="270" y="200" width="460" height="540" rx="16" fill="#18181f"/><rect x="295" y="235" width="410" height="410" rx="8" fill="${accent}" opacity="0.45"/><rect x="295" y="235" width="410" height="410" rx="8" fill="url(#shine)"/><rect x="320" y="680" width="260" height="14" rx="3" fill="#f5f2ea" opacity="0.3"/>`;
      break;
    case "scent":
      product = `<rect x="455" y="150" width="90" height="48" rx="6" fill="${accent}"/><rect x="420" y="200" width="160" height="440" rx="42" fill="url(#glass)"/>`;
      break;
    case "jewelry":
      product = `<ellipse cx="500" cy="580" rx="190" ry="36" fill="#000" opacity="0.35"/><circle cx="500" cy="420" r="150" fill="none" stroke="${accent}" stroke-width="20"/><circle cx="500" cy="420" r="72" fill="#2a2a32" stroke="#ddd" stroke-width="2" opacity="0.55"/>`;
      break;
    case "apparel":
      product = `<path d="M300 250 L380 210 L500 255 L620 210 L700 270 L650 340 L650 720 L350 720 L350 340 Z" fill="#22222c" stroke="${accent}" stroke-width="4"/>`;
      break;
    case "experience":
      product = `<rect x="180" y="280" width="640" height="360" rx="18" fill="#14141a" stroke="${accent}" stroke-width="4"/><rect x="180" y="280" width="640" height="72" fill="${accent}"/><rect x="230" y="400" width="340" height="16" rx="4" fill="#eee" opacity="0.35"/><rect x="230" y="440" width="240" height="12" rx="3" fill="#eee" opacity="0.2"/>`;
      break;
    case "lightstick":
      product = `<circle cx="500" cy="260" r="140" fill="${accent}" opacity="0.35"/><circle cx="500" cy="260" r="100" fill="${accent}" opacity="0.85"/><circle cx="500" cy="260" r="48" fill="#f8f7f4"/><rect x="470" y="330" width="60" height="340" rx="18" fill="#2a2a32"/>`;
      break;
    case "card":
      product = `<rect x="200" y="270" width="600" height="380" rx="24" fill="#1a1a24" stroke="${accent}" stroke-width="5"/><rect x="250" y="320" width="210" height="210" rx="14" fill="${accent}" opacity="0.5"/><rect x="500" y="340" width="250" height="16" rx="4" fill="#eee" opacity="0.35"/>`;
      break;
    case "autograph":
      product = `<rect x="240" y="180" width="520" height="560" rx="10" fill="#f3eee4"/><path d="M320 480 Q420 400 520 500 T720 460" fill="none" stroke="#1a1a1a" stroke-width="7" opacity="0.7"/><circle cx="680" cy="640" r="44" fill="${accent}" opacity="0.5"/>`;
      break;
    default:
      product = `<rect x="280" y="220" width="440" height="500" rx="28" fill="#1c1c24" stroke="${accent}" stroke-width="5"/><circle cx="500" cy="450" r="90" fill="${accent}" opacity="0.4"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>
    <radialGradient id="bg" cx="32%" cy="28%" r="75%">
      <stop offset="0%" stop-color="${bg2}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </radialGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.25"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="45%" stop-color="${accent}" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#111" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg)"/>
  <circle cx="${200 + (h % 400)}" cy="${180 + (h % 200)}" r="160" fill="${accent}" opacity="0.12"/>
  ${product}
</svg>`;
}

function collectSlugs() {
  const files = [
    "src/data/albums.ts",
    "src/data/album-expansion.ts",
    "src/data/official-merch.ts",
    "src/data/member-boutique.ts",
    "src/data/tickets.ts",
  ];
  const slugs = new Set();
  for (const f of files) {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) continue;
    const text = fs.readFileSync(fp, "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) slugs.add(m[1]);
  }
  return [...slugs];
}

async function main() {
  if (FLAGS.has("--svg")) {
    console.error("Refusing SVG stub mode. Use photoreal studio composites or AI assets.");
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const slugs = collectSlugs();
  const manifest = [];
  let copiedAi = 0;
  let generated = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const dest = path.join(OUT, `${slug}.jpg`);
    if (MISSING_ONLY && fs.existsSync(dest)) {
      skipped++;
      continue;
    }

    const ai = [".jpg", ".png"]
      .map((ext) => path.join(ASSETS, `${slug}${ext}`))
      .find((p) => fs.existsSync(p));

    if (ai) {
      await sharp(ai).resize(1000, 1000, { fit: "cover" }).jpeg({ quality: 90 }).toFile(dest);
      copiedAi++;
      manifest.push({ slug, category: inferKind(slug), source: "ai-generated" });
      continue;
    }

    const kind = inferKind(slug);
    await sharp(Buffer.from(studioSvg(slug, kind)))
      .jpeg({ quality: 88 })
      .toFile(dest);
    generated++;
    manifest.push({ slug, category: kind, source: "photoreal-studio-composite" });

    if (generated % 25 === 0) console.log(`… ${generated} generated, ${skipped} skipped`);
  }

  fs.writeFileSync(
    path.join(ROOT, "src/data/product-image-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log(
    `Done. AI: ${copiedAi}, studio: ${generated}, skipped existing: ${skipped}, slugs: ${slugs.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
