import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { checkRateLimit } from "@/lib/rate-limit";
import { packedScripts } from "@/generated/scripts";

const VALID_GAMES = [
  "loader",
  "mm2",
  "pressure",
  "demonology",
  "universal",
  "mm2_mobile",
  "pressure_mobile",
  "demonology_mobile",
  "universal_mobile",
];

function verifyToken(game: string, token: string | null, exp: string | null): boolean {
  if (!token || !exp) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return false;

  const key = process.env.SCRIPT_HMAC_KEY || "";
  const expected = crypto.createHmac("sha256", key).update(`${game}|${expNum}`).digest("hex");

  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { game: string } }
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const game = params.game.toLowerCase();

  if (!VALID_GAMES.includes(game)) {
    return new NextResponse("Script not found", { status: 404 });
  }

  const rate = checkRateLimit(`script:${ip}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rate.success) {
    return new NextResponse("Too many requests. Try again shortly.", { status: 429 });
  }

  // Hide payloads from normal browser navigations without blocking mobile executors
  // that reuse a browser-like User-Agent but do not send navigation headers.
  const isBrowserNavigation =
    request.headers.get("sec-fetch-dest") === "document" ||
    request.headers.get("upgrade-insecure-requests") === "1";
  if (isBrowserNavigation) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  let payload = packedScripts[game];

  // Dev fallback: serve plaintext source when the bundle wasn't generated yet.
  if (!payload && process.env.NODE_ENV !== "production") {
    const filePath = path.join(process.cwd(), "scripts-src", `${game}.lua`);
    if (fs.existsSync(filePath)) {
      payload = fs.readFileSync(filePath, "utf-8");
    }
  }

  if (!payload) {
    return new NextResponse("Script unavailable", { status: 404 });
  }

  // Game scripts require a short-lived signed token. The loader itself is public.
  if (game !== "loader") {
    const token = request.nextUrl.searchParams.get("token");
    const exp = request.nextUrl.searchParams.get("exp");
    if (!verifyToken(game, token, exp)) {
      return new NextResponse("Access denied", { status: 403 });
    }
  }

  return new NextResponse(payload, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-cache",
      "Cloudflare-CDN-Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
