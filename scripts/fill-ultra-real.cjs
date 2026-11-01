/**
 * Fill EVERY product/experience/concert/era card with ultra-real AI masters.
 * Unique crop + color grade per slug so cards never look empty or identical stubs.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "d-BTS",
  "assets"
);
const OUT = path.join(ROOT, "public", "products");
const EXP = path.join(ROOT, "public", "experiences");
const CON = path.join(ROOT, "public", "concerts");
const ERAS = path.join(ROOT, "public", "eras");
const FALLBACKS = path.join(ROOT, "public", "fallbacks");

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function master(name) {
  const p = path.join(ASSETS, name);
  if (!fs.existsSync(p)) throw new Error("Missing master: " + name);
  return p;
}

/** Logical master pick — most specific rules first */
function pickMaster(slug) {
  const s = slug.toLowerCase();

  if (/online-meet|video-call|weverse-video/.test(s)) return "master-online-meet.jpg";
  if (/online-fansign/.test(s)) return "master-fansign.jpg";
  if (/meet-greet|fan-meeting-vip|vip-pass|in-person|hope-on-stage-meet/.test(s))
    return "master-vip-pass.jpg";
  if (/fan-sign|fansign/.test(s)) return "master-fansign.jpg";

  if (/light-stick|lightstick|army-bomb/.test(s)) return "master-lightstick.jpg";
  if (/incense/.test(s)) return "master-incense.jpg";
  if (/body-mist|mist/.test(s) && !/album/.test(s)) return "master-mist.jpg";
  if (/parfum|eau|fragrance|scent|citrus|musk|solar|jazz|smoke|rose|leather/.test(s) && !/album/.test(s))
    return "master-perfume.jpg";

  if (/earring|stud/.test(s)) return "master-earrings.jpg";
  if (/bracelet/.test(s)) return "master-bracelet.jpg";
  if (/pendant|chain|necklace/.test(s)) return "master-necklace.jpg";
  if (/ring|septet/.test(s)) return "master-ring.jpg";

  if (/photocard-pack|pc-pack/.test(s)) return "master-photocard-pack.jpg";
  if (/army-card|membership|merch-pack/.test(s)) return "master-card.jpg";

  if (/signed|autograph|polaroid|art-print|vinyl-sleeve|booklet|poster/.test(s) && !/album/.test(s))
    return "master-autograph.jpg";

  if (/beanie/.test(s)) return "master-beanie.jpg";
  if (/cap/.test(s)) return "master-cap.jpg";
  if (/scarf/.test(s)) return "master-scarf.jpg";
  if (/tote/.test(s)) return "master-tote.jpg";
  if (/slipmat/.test(s)) return "master-slipmat.jpg";
  if (/cargo/.test(s)) return "master-cargo.jpg";
  if (/coat/.test(s)) return "master-coat.jpg";
  if (/track-jacket|track/.test(s)) return "master-track.jpg";
  if (/bomber|jacket/.test(s)) return "master-bomber.jpg";
  if (/hoodie/.test(s)) return "master-hoodie.jpg";
  if (/tee|t-shirt/.test(s)) return "master-tee.jpg";

  if (/lp|vinyl/.test(s)) return "master-vinyl.jpg";
  if (/weverse-albums|weverse-album|weverse-exclusive|compact/.test(s))
    return "master-weverse-albums.jpg";
  if (/happy|face|muse|pearl|rose|astronaut/.test(s)) return "master-album-rose.jpg";
  if (/dday|agust|jack|golden|dark|proof|black/.test(s)) return "master-album-black.jpg";
  if (/album|anthology|persona|tear|her|be-|hyyh|wings|ynwa|you-never|love-yourself|map-of|arirang|butter|permission|dynamite|2-cool|o-rul8|skool|rpwp|hope-world|on-the-street|friends|winter|3d-single|seven-single|indigo|echo|layover|jitb/.test(s))
    return "master-album-purple.jpg";

  return "master-album-purple.jpg";
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
    const text = fs.readFileSync(path.join(ROOT, f), "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) slugs.add(m[1]);
  }
  return [...slugs];
}

async function uniqueJpeg(srcPath, slug, size = 1000) {
  const h = hash(slug);
  const meta = await sharp(srcPath).metadata();
  const w = meta.width || size;
  const hh = meta.height || size;
  // Unique crop window
  const zoom = 1.05 + (h % 12) / 100; // 1.05–1.16
  const cropW = Math.floor(w / zoom);
  const cropH = Math.floor(hh / zoom);
  const left = Math.floor(((h >> 3) % 100) / 100 * (w - cropW));
  const top = Math.floor(((h >> 7) % 100) / 100 * (hh - cropH));
  const brightness = 1 + ((h % 9) - 4) / 100; // ~0.96–1.04
  const saturation = 1 + ((h % 7) - 3) / 50;

  return sharp(srcPath)
    .extract({
      left: Math.max(0, left),
      top: Math.max(0, top),
      width: Math.min(cropW, w),
      height: Math.min(cropH, hh),
    })
    .resize(size, size, { fit: "cover" })
    .modulate({ brightness, saturation })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function writeProduct(slug) {
  const m = pickMaster(slug);
  const src = master(m);
  const buf = await uniqueJpeg(src, slug, 1000);
  await sharp(buf).toFile(path.join(OUT, `${slug}.jpg`));
  // gallery secondary always present
  const gBuf = await uniqueJpeg(src, slug + "-g1", 1000);
  await sharp(gBuf).toFile(path.join(OUT, `${slug}-g1.jpg`));
  return m;
}

async function copyFallback(name, destDir, destName) {
  fs.mkdirSync(destDir, { recursive: true });
  const src = master(name);
  await sharp(src)
    .resize(1600, 900, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toFile(path.join(destDir, destName));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(EXP, { recursive: true });
  fs.mkdirSync(CON, { recursive: true });
  fs.mkdirSync(ERAS, { recursive: true });
  fs.mkdirSync(FALLBACKS, { recursive: true });

  const slugs = collectSlugs();
  const manifest = [];
  console.log("Filling", slugs.length, "products from AI masters…");

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const m = await writeProduct(slug);
    manifest.push({ slug, category: pickMaster(slug), source: "ai-master-variant", master: m });
    if ((i + 1) % 25 === 0) console.log(`… ${i + 1}/${slugs.length}`);
  }

  // Experiences
  const expMap = {
    "online-meet.jpg": "master-online-meet.jpg",
    "online-fansign.jpg": "master-fansign.jpg",
    "inperson-meet.jpg": "master-vip-pass.jpg",
    "inperson-fansign.jpg": "master-fansign.jpg",
    "hi-touch.jpg": "master-vip-pass.jpg",
    "ot7-fanmeet.jpg": "master-concert-seats.jpg",
    "video-call.jpg": "master-online-meet.jpg",
    "default.jpg": "master-vip-pass.jpg",
  };
  for (const [dest, src] of Object.entries(expMap)) {
    await sharp(master(src))
      .resize(1600, 900, { fit: "cover" })
      .jpeg({ quality: 90 })
      .toFile(path.join(EXP, dest));
  }

  // Concerts — rotate crowd/seats
  await sharp(master("master-concert-crowd.jpg"))
    .resize(1600, 900, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toFile(path.join(CON, "arirang-hero.jpg"));
  await sharp(master("master-concert-seats.jpg"))
    .resize(1600, 900, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toFile(path.join(CON, "arirang-seats.jpg"));

  // Era card backgrounds
  const eraMasters = {
    "2c4s": "master-album-black.jpg",
    hyyh: "master-album-rose.jpg",
    wings: "master-album-purple.jpg",
    ly: "master-album-rose.jpg",
    mots: "master-album-black.jpg",
    be: "master-album-purple.jpg",
    proof: "master-album-black.jpg",
    solo: "master-vinyl.jpg",
  };
  for (const [era, m] of Object.entries(eraMasters)) {
    await sharp(master(m))
      .resize(1200, 800, { fit: "cover" })
      .modulate({ brightness: 0.75, saturation: 1.05 })
      .jpeg({ quality: 88 })
      .toFile(path.join(ERAS, `${era}.jpg`));
  }

  // Category fallbacks for UI onError
  const fb = {
    album: "master-album-purple.jpg",
    apparel: "master-hoodie.jpg",
    jewelry: "master-ring.jpg",
    fragrance: "master-perfume.jpg",
    experience: "master-vip-pass.jpg",
    lightstick: "master-lightstick.jpg",
    "army-card": "master-card.jpg",
    autograph: "master-autograph.jpg",
    merch: "master-tote.jpg",
    default: "master-album-purple.jpg",
  };
  for (const [k, m] of Object.entries(fb)) {
    await sharp(master(m))
      .resize(1000, 1000, { fit: "cover" })
      .jpeg({ quality: 88 })
      .toFile(path.join(FALLBACKS, `${k}.jpg`));
  }

  fs.writeFileSync(
    path.join(ROOT, "src/data/product-image-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("Done. Products:", slugs.length, "All cards have AI-derived photos.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
