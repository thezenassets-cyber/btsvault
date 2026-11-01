const fs = require("fs");
const files = [
  "src/data/albums.ts",
  "src/data/album-expansion.ts",
  "src/data/official-merch.ts",
  "src/data/member-boutique.ts",
];
const slugs = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  let m;
  const re = /slug:\s*"([^"]+)"/g;
  while ((m = re.exec(t))) slugs.add(m[1]);
}
const featured = [
  "arirang-album-set",
  "wings-album",
  "you-never-walk-alone",
  "love-yourself-answer",
  "rm-right-place-wrong-person",
  "jimin-muse-album",
  "jungkook-golden-album",
  "bts-official-light-stick-ver4",
  "army-membership-kit-2026",
  "jungkook-golden-online-meet",
  "v-layover-lp",
  "bts-incense-stick-arirang",
];
for (const s of featured) {
  const exists = slugs.has(s);
  const p = "public/products/" + s + ".jpg";
  const img = fs.existsSync(p);
  console.log(s, exists ? "slugOK" : "slugMISS", img ? "imgOK " + fs.statSync(p).size : "imgMISS");
}
console.log("--- related ---");
[...slugs]
  .filter((s) => /membership|incense|arirang|light-stick|signed|autograph|2-cool|o-rul8/.test(s))
  .forEach((s) => console.log(s));
