const fs = require("fs");
const path = require("path");
const assets = path.join(
  process.env.USERPROFILE,
  ".cursor",
  "projects",
  "d-BTS",
  "assets"
);
const exp = "d:/BTS/public/experiences";
const con = "d:/BTS/public/concerts";
const prod = "d:/BTS/public/products";
fs.mkdirSync(exp, { recursive: true });
fs.mkdirSync(con, { recursive: true });

const map = [
  ["arirang-hero.jpg", path.join(con, "arirang-hero.jpg")],
  ["online-meet.jpg", path.join(exp, "online-meet.jpg")],
  ["inperson-meet.jpg", path.join(exp, "inperson-meet.jpg")],
  ["online-fansign.jpg", path.join(exp, "online-fansign.jpg")],
  ["inperson-fansign.jpg", path.join(exp, "inperson-fansign.jpg")],
  ["hi-touch.jpg", path.join(exp, "hi-touch.jpg")],
  ["ot7-fanmeet.jpg", path.join(exp, "ot7-fanmeet.jpg")],
  ["video-call.jpg", path.join(exp, "video-call.jpg")],
  ["album-studio-hero.jpg", path.join(exp, "default.jpg")],
  ["wings-album.jpg", path.join(prod, "wings-album.jpg")],
  ["rm-indigo-meet-greet-pass.jpg", path.join(prod, "rm-indigo-meet-greet-pass.jpg")],
];

for (const [src, dest] of map) {
  const s = path.join(assets, src);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, dest);
    console.log("ok", dest);
  } else console.log("missing", s);
}
