const fs = require("fs");

const ts = fs.readFileSync("src/generated/scripts.ts", "utf8");
const start = ts.indexOf("{");
const end = ts.lastIndexOf("}");
const obj = JSON.parse(ts.slice(start, end + 1));

function decode(bundle) {
  const km = bundle.match(/_K=\{(0x[0-9a-fx,]+)\}/);
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

let ok = true;
for (const slug of Object.keys(obj)) {
  const decoded = decode(obj[slug]);
  const orig = fs.readFileSync(`scripts-src/${slug}.lua`, "utf8");
  const eq = decoded === orig;
  if (!eq) ok = false;
  console.log(`${slug}: orig=${orig.length} decoded=${decoded.length} equal=${eq}`);
}
process.exit(ok ? 0 : 1);
