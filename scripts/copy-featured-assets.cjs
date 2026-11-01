const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS = path.join(
  process.env.USERPROFILE,
  ".cursor",
  "projects",
  "d-BTS",
  "assets"
);
const OUT = "d:/BTS/public/products";

const direct = [
  "arirang-album-set.jpg",
  "wings-album.jpg",
  "you-never-walk-alone.jpg",
  "love-yourself-answer.jpg",
  "rm-right-place-wrong-person.jpg",
  "jimin-muse-album.jpg",
  "jungkook-golden-album.jpg",
  "bts-official-light-stick-ver4.jpg",
  "army-membership-kit-2026.jpg",
  "jungkook-golden-online-meet.jpg",
  "v-layover-lp.jpg",
  "bts-incense-stick-arirang.jpg",
  "jin-signed-astronaut-polaroid.jpg",
  "rm-signed-indigo-booklet.jpg",
  "ot7-signed-group-poster.jpg",
  "2-cool-4-skool.jpg",
  "arirang-ticket-ga.jpg",
  "arirang-ticket-vip.jpg",
  "arirang-ticket-bulk-8.jpg",
  "jungkook-signed-golden-vinyl-sleeve.jpg",
  "suga-signed-agust-d-art-print.jpg",
];

async function copyOne(name, destName) {
  const src = path.join(ASSETS, name);
  const dest = path.join(OUT, destName || name);
  if (!fs.existsSync(src)) {
    console.log("MISS", name);
    return;
  }
  await sharp(src).resize(1000, 1000, { fit: "cover" }).jpeg({ quality: 92 }).toFile(dest);
  // gallery
  const g = dest.replace(/\.jpg$/, "-g1.jpg");
  await sharp(src)
    .resize(1100, 1100, { fit: "cover", position: "entropy" })
    .jpeg({ quality: 90 })
    .toFile(g);
  console.log("ok", path.basename(dest));
}

(async () => {
  for (const n of direct) await copyOne(n);
  // ticket pack aliases
  await copyOne("arirang-ticket-ga.jpg", "arirang-ticket-ga-bulk-4.jpg");
  await copyOne("arirang-ticket-vip.jpg", "arirang-ticket-vip-bulk-2.jpg");
  await copyOne("arirang-ticket-vip.jpg", "arirang-soundcheck-pass.jpg");
  // more signed if masters exist for other members - reuse autograph master variants
  const signed = [
    "jhope-signed-hope-world-art.jpg",
    "jimin-signed-like-crazy-poster.jpg",
    "v-signed-layover-polaroid.jpg",
  ];
  for (const s of signed) {
    const src = path.join(ASSETS, "master-autograph.jpg");
    if (fs.existsSync(path.join(ASSETS, s))) await copyOne(s);
    else if (fs.existsSync(src)) {
      await sharp(src).resize(1000, 1000, { fit: "cover" }).jpeg({ quality: 90 }).toFile(path.join(OUT, s));
      console.log("fallback", s);
    }
  }
  console.log("done");
})();
