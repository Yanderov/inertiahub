const fs = require("fs");

function strip(src) {
  return src
    .replace(/--\[\[[\s\S]*?\]\]/g, "")
    .replace(/--.*$/gm, "")
    .replace(/\n\s*\n/g, "\n");
}

for (const file of ["loader.lua"]) {
  const src = fs.readFileSync(`scripts-src/${file}`, "utf8");
  const s = strip(src);
  let depth = 0;
  let min = 0;
  let lineNo = 0;
  for (const raw of s.split("\n")) {
    lineNo++;
    const line = raw;
    if (/\bif\b.*\bthen\b/.test(line)) depth++;
    if (/\bfor\b.*\bdo\b/.test(line) || /\bwhile\b.*\bdo\b/.test(line)) depth++;
    if (/^function\b/.test(line) || /\bfunction\b[^(]*\(/.test(line)) depth++;
    const ends = (line.match(/\bend\b/g) || []).length;
    depth -= ends;
    if (/\brepeat\b/.test(line)) depth++;
    if (/\buntil\b/.test(line)) depth--;
    if (depth < min) min = depth;
  }
  console.log(`${file}: final depth=${depth} min=${min}`);
}
