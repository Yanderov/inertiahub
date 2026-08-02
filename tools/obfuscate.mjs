import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "scripts-src");
const OUT_DIR = path.join(ROOT, "src", "generated");
const OUT_FILE = path.join(OUT_DIR, "scripts.ts");

const CHUNK_BYTES = 8000;

function chunkHex(hex) {
  const chunks = [];
  for (let i = 0; i < hex.length; i += CHUNK_BYTES * 2) {
    chunks.push(hex.slice(i, i + CHUNK_BYTES * 2));
  }
  return chunks;
}

function randomKey() {
  const bytes = crypto.randomBytes(24);
  return Array.from(bytes);
}

function randomName(prefix) {
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${prefix}_${suffix}`;
}

// Expands Luau-only compound assignments (x += y -> x = x + y) so the bundle
// also runs under plain Lua 5.1 loadstrings (e.g. sandboxed executors).
// Matches compounds anywhere on the line (not just as a whole-line assignment);
// the tail after the operator (including comments) is left untouched.
function transpileLuau53(source) {
  return source.replace(
    /\b([A-Za-z_][A-Za-z0-9_.]*)\s*(\.\.=|\+=|-=|\*=|%=|\/=)\s*/g,
    (m, lhs, op, offset, full) => {
      const before = full.slice(full.lastIndexOf("\n", offset) + 1, offset);
      if (before.includes("--")) return m;
      const realOp = op === "..=" ? ".." : op[0];
      return `${lhs} = ${lhs} ${realOp} `;
    }
  );
}

function buildBundle(source) {
  const k1 = randomKey();
  const k2 = randomKey();

  // Additive double-key encoding (no bitwise ops) so the decoder compiles
  // on both Luau and plain Lua 5.1.
  const bytes = Buffer.from(source, "utf8");
  const parts = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push((bytes[i] + k1[i % k1.length] + k2[i % k2.length]) % 256);
  }
  const hex = Buffer.from(parts).toString("hex");
  const chunks = chunkHex(hex);

  const k1Literal = k1.map((b) => "0x" + b.toString(16).padStart(2, "0")).join(",");
  const k2Literal = k2.map((b) => "0x" + b.toString(16).padStart(2, "0")).join(",");
  const chunkLiteral = chunks.map((c) => `\t"${c}"`).join(",\n");

  const junkA = Array.from(crypto.randomBytes(8))
    .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
    .join(",");
  const junkB = Array.from(crypto.randomBytes(8))
    .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
    .join(",");

  const g = randomName("g");
  const ka = randomName("ka");
  const kb = randomName("kb");
  const nA = randomName("nA");
  const nB = randomName("nB");
  const ic = randomName("ic");
  const dc = randomName("dc");
  const hx = randomName("hx");
  const la = randomName("la");
  const lb = randomName("lb");
  const cc = randomName("cc");
  const dd = randomName("dd");
  const sc = randomName("sc");
  const ld = randomName("ld");
  const jk = randomName("jk");
  const tmp = randomName("tmp");
  const tmp2 = randomName("tmp2");
  const fn = randomName("fn");

  return `--[[ inertiahub runtime bundle :: 4f2c9d1e ]]
local ${g}=function(${tmp})
	if ${tmp}==nil then return false end
	if ${tmp}.GetService==nil then return false end
	return true
end
if not ${g}(game) then return end
local ${jk}=({({${junkA}})})[1]
local ${ka}={${k1Literal}}
local ${kb}={${k2Literal}}
local ${nA}=#${ka}
local ${nB}=#${kb}
local ${ic}=0
local ${dc}
${dc}=function(${hx})
	${ic}=${ic}+1
	local ${la}=(${ic}-1)%${nA}+1
	local ${lb}=(${ic}-1)%${nB}+1
	return string.char((tonumber(${hx},16) - ${ka}[${la}] - ${kb}[${lb}]) % 256)
end
local ${cc}={
${chunkLiteral}
}
local ${dd}={}
for ${sc}=1,#${cc} do ${dd}[${sc}]=${cc}[${sc}]:gsub("%x%x",${dc}) end
local ${ld}=table.concat(${dd})
local ${tmp2}=({({${junkB}})})[1]
local ${fn}=loadstring or load
if type(${fn})~="function" then return end
return ${fn}(${ld})()
`;
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`scripts-src directory not found: ${SRC_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".lua"));
  if (files.length === 0) {
    console.error("No .lua sources found in scripts-src/");
    process.exit(1);
  }

  // Auto-injected module appended to every game bundle (overhead hub tag).
  const tagPath = path.join(SRC_DIR, "_hubtag.lua");
  const hubTagCode = fs.existsSync(tagPath)
    ? "\n" + fs.readFileSync(tagPath, "utf8") + "\n"
    : "";

  // Game bundles that get the hub-tag injected (loader already ships its own).
  const TAG_INJECT_SLUGS = new Set(["mm2", "pressure", "demonology"]);

  // Modules injected only into specific games.
  const CHAT_INJECT_SLUGS = new Set(["mm2"]);
  const chatPath = path.join(SRC_DIR, "_mm2chat.lua");
  const mm2ChatCode = fs.existsSync(chatPath)
    ? "\n" + fs.readFileSync(chatPath, "utf8") + "\n"
    : "";

  const entries = {};
  for (const file of files) {
    const slug = file.replace(/\.lua$/, "");
    if (slug.startsWith("_")) continue; // internal modules, not served directly

    let source = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
    source = transpileLuau53(source);
    const baseSlug = slug.replace(/_mobile$/, "");
    if (TAG_INJECT_SLUGS.has(baseSlug)) {
      source = source + hubTagCode;
    }
    if (CHAT_INJECT_SLUGS.has(baseSlug) && mm2ChatCode) {
      source = source + mm2ChatCode;
    }
    const bundle = buildBundle(source);
    entries[slug] = bundle;
    console.log(`packed ${file} (${(source.length / 1024).toFixed(1)} KB -> ${(bundle.length / 1024).toFixed(1)} KB)`);
  }

  const ts =
    `// Auto-generated by tools/obfuscate.mjs — do not edit.\n` +
    `// Packed runtime bundles served through /api/v1/script/[game].\n` +
    `export const packedScripts: Record<string, string> = ${JSON.stringify(entries, null, 2)};\n`;

  fs.writeFileSync(OUT_FILE, ts, "utf8");
  console.log(`wrote ${path.relative(ROOT, OUT_FILE)} (${(ts.length / 1024 / 1024).toFixed(2)} MB)`);
}

main();
