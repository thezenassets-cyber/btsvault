const fs = require("fs");
const path = "d:/BTS/src/data/member-boutique.ts";
let s = fs.readFileSync(path, "utf8");

const startMarker = "slug: line.meet.slug,";
const endMarker = "slug: line.extra.slug,";
const startIdx = s.lastIndexOf("    {\n      ...base,\n      id:", s.indexOf(startMarker));
// Find the block starting at id `${m}-mg`
const mgBlock = s.indexOf("line.meet.slug");
const extraBlock = s.indexOf("line.extra.slug");
if (mgBlock < 0 || extraBlock < 0) {
  console.error("not found", mgBlock, extraBlock);
  process.exit(1);
}
// Back up to the opening brace of mg product
let start = s.lastIndexOf("    {", mgBlock);
let end = s.lastIndexOf("    {", extraBlock);

const replacement = `    {
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
    },
`;

s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(path, s);
console.log("fixed", start, end);
