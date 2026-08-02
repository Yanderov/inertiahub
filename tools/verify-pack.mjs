const fs = require("fs");

const ts = fs.readFileSync("src/generated/scripts.ts", "utf8");

function extractBundle(slug) {
  const start = ts.indexOf(`"${slug}": "`);
  if (start < 0) throw new Error("slug not found: " + slug);
  const seg = ts.slice(start);
  const end = seg.indexOf('",\n  ');
  let raw = seg.slice(`"${slug}": `.length, end);
  return JSON.parse('"' + raw + '"');
}

function decode(bundle) {
  const km = bundle.match(/_K=\{(0x[0-9a-f,]+)\}/);
  const key = km[1].split(",").map((x) => parseInt(x, 16));
  const chunks = [...bundle.matchAll(/^\t"([0-9a-f]+)",?$/gm)].map((x) => x[1]);
  const hex = chunks.join("");
  const out = [];
  for (let i = 0; i < hex.length; i += 2) {
    const j = i / 2;
    out.push(parseInt(hex.slice(i, i + 2), 16) ^ key[j % key.length]);
  }
  return Buffer.from(out).toString("utf8");
}

for (const slug of ["loader", "mm2", "pressure", "demonology"]) {
  const bundle = extractBundle(slug);
  const decoded = decode(bundle);
  const orig = fs.readFileSync(`scripts-src/${slug}.lua`, "utf8");
  console.log(
    `${slug}: orig=${orig.length} decoded=${decoded.length} equal=${decoded === orig}`
  );
}
