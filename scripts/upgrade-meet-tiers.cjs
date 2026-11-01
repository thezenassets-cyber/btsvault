const fs = require("fs");
const path = "d:/BTS/src/data/member-boutique.ts";
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  /meet: \{ slug: string; name: string; price: number \};\n  fansign: \{ slug: string; name: string; price: number \};/,
  `onlineMeet: { slug: string; name: string; price: number };
  onlineFansign: { slug: string; name: string; price: number };
  inPersonMeet: { slug: string; name: string; price: number };
  inPersonFansign: { slug: string; name: string; price: number };`
);

const prices = {
  rm: { om: 119, of: 79, im: 980, ifs: 520 },
  jin: { om: 109, of: 69, im: 920, ifs: 490 },
  suga: { om: 129, of: 89, im: 1050, ifs: 580 },
  jhope: { om: 99, of: 65, im: 890, ifs: 470 },
  jimin: { om: 139, of: 85, im: 1100, ifs: 620 },
  v: { om: 125, of: 82, im: 1020, ifs: 560 },
  jungkook: { om: 149, of: 99, im: 1200, ifs: 680 },
};

const members = [
  ["rm", "rm-indigo-meet-greet-pass", "RM Indigo Meet & Greet Pass", "rm-indigo-fan-sign-ticket", "Indigo Fan-Sign Ticket", "indigo"],
  ["jin", "jin-globe-meet-greet-pass", "Jin Globe Meet & Greet Pass", "jin-happy-fan-sign-ticket", "Happy Fan-Sign Ticket", "happy"],
  ["suga", "suga-agust-d-meet-greet-pass", "Agust D Meet & Greet Pass", "suga-dday-fan-sign-ticket", "D-DAY Fan-Sign Ticket", "dday"],
  ["jhope", "jhope-hope-on-stage-meet-greet", "Hope On Stage Meet & Greet", "jhope-jitb-fan-sign-ticket", "Jack Fan-Sign Ticket", "jack"],
  ["jimin", "jimin-face-meet-greet-pass", "FACE Meet & Greet Pass", "jimin-face-fan-sign-ticket", "FACE Fan-Sign Ticket", "face"],
  ["v", "v-layover-meet-greet-pass", "Layover Meet & Greet Pass", "v-layover-fan-sign-ticket", "Layover Fan-Sign Ticket", "layover"],
  ["jungkook", "jungkook-golden-meet-greet-pass", "GOLDEN Meet & Greet Pass", "jungkook-golden-fan-sign-ticket", "GOLDEN Fan-Sign Ticket", "golden"],
];

for (const [id, ms, mn, fsSlug, fn, era] of members) {
  const p = prices[id];
  const re = new RegExp(
    `meet: \\{ slug: "${ms}"[^\\n]*\\n\\s*fansign: \\{ slug: "${fsSlug}"[^\\n]*\\},`
  );
  const rep = `onlineMeet: { slug: "${id}-${era}-online-meet", name: "${mn} — Online", price: ${p.om} },
    onlineFansign: { slug: "${id}-${era}-online-fansign", name: "${fn} — Online", price: ${p.of} },
    inPersonMeet: { slug: "${ms}", name: "${mn} — In Person", price: ${p.im} },
    inPersonFansign: { slug: "${fsSlug}", name: "${fn} — In Person", price: ${p.ifs} },`;
  if (!re.test(s)) {
    console.error("FAIL", id);
    process.exit(1);
  }
  s = s.replace(re, rep);
}

// Replace build experience products
const oldBuild = `    {
      ...base,
      id: \`\${m}-mg\`,
      slug: line.meet.slug,
      name: line.meet.name,
      description: \`Priority meet & greet experience with \${line.label}. Fan-project listing.\`,
      type: "experience",
      rarity: "tour-exclusive",
      msrp: line.meet.price,
      listingPrice: line.meet.price,
      tags: ["meet-greet", "experience", m],
      experienceId: \`\${m}-mg\`,
      sku: \`AV-\${m.toUpperCase()}-EXP-01\`,
    },
    {
      ...base,
      id: \`\${m}-fansign\`,
      slug: line.fansign.slug,
      name: line.fansign.name,
      description: \`Lottery-priority fan-sign seat for \${line.solo} season events.\`,
      type: "experience",
      rarity: "limited",
      msrp: line.fansign.price - 20,
      listingPrice: line.fansign.price,
      tags: ["fan-sign", "experience", m],
      experienceId: \`\${m}-fansign\`,
      sku: \`AV-\${m.toUpperCase()}-EXP-02\`,
    },`;

const newBuild = `    {
      ...base,
      id: \`\${m}-mg-online\`,
      slug: line.onlineMeet.slug,
      name: line.onlineMeet.name,
      description: \`Online video meet & greet with \${line.label}. Virtual slot for worldwide ARMY.\`,
      type: "experience",
      rarity: "limited",
      msrp: line.onlineMeet.price - 10,
      listingPrice: line.onlineMeet.price,
      tags: ["meet-greet", "experience", "online", m],
      experienceId: \`\${m}-mg-online\`,
      experienceFormat: "online",
      sku: \`AV-\${m.toUpperCase()}-EXP-OM\`,
    },
    {
      ...base,
      id: \`\${m}-fansign-online\`,
      slug: line.onlineFansign.slug,
      name: line.onlineFansign.name,
      description: \`Online fan-sign slot with \${line.label} — virtual signing for \${line.solo} season.\`,
      type: "experience",
      rarity: "standard",
      msrp: line.onlineFansign.price - 5,
      listingPrice: line.onlineFansign.price,
      tags: ["fan-sign", "experience", "online", m],
      experienceId: \`\${m}-fansign-online\`,
      experienceFormat: "online",
      sku: \`AV-\${m.toUpperCase()}-EXP-OF\`,
    },
    {
      ...base,
      id: \`\${m}-mg\`,
      slug: line.inPersonMeet.slug,
      name: line.inPersonMeet.name,
      description: \`In-person stadium/city meet & greet with \${line.label}. Worldwide tour-stop experience.\`,
      type: "experience",
      rarity: "tour-exclusive",
      msrp: line.inPersonMeet.price - 50,
      listingPrice: line.inPersonMeet.price,
      tags: ["meet-greet", "experience", "in-person", m],
      experienceId: \`\${m}-mg\`,
      experienceFormat: "in-person",
      sku: \`AV-\${m.toUpperCase()}-EXP-IM\`,
    },
    {
      ...base,
      id: \`\${m}-fansign\`,
      slug: line.inPersonFansign.slug,
      name: line.inPersonFansign.name,
      description: \`In-person fan-sign seat for \${line.solo} season events worldwide.\`,
      type: "experience",
      rarity: "limited",
      msrp: line.inPersonFansign.price - 30,
      listingPrice: line.inPersonFansign.price,
      tags: ["fan-sign", "experience", "in-person", m],
      experienceId: \`\${m}-fansign\`,
      experienceFormat: "in-person",
      sku: \`AV-\${m.toUpperCase()}-EXP-IF\`,
    },`;

if (!s.includes("line.meet.slug")) {
  console.error("build block already changed or missing");
  process.exit(1);
}
s = s.replace(oldBuild, newBuild);

fs.writeFileSync(path, s);
console.log("member-boutique updated");
