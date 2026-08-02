import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_GAMES = ["loader", "mm2", "pressure", "demonology", "mm2_mobile", "pressure_mobile", "demonology_mobile"];
const TOKEN_TTL_MS = 5 * 60 * 1000;

function signToken(game: string, exp: number): string {
  const key = process.env.SCRIPT_HMAC_KEY || "";
  return crypto.createHmac("sha256", key).update(`${game}|${exp}`).digest("hex");
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rate = checkRateLimit(`script_token:${ip}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many token requests. Try again shortly." },
      { status: 429 }
    );
  }

  const game = req.nextUrl.searchParams.get("game")?.toLowerCase() || "";
  if (!VALID_GAMES.includes(game)) {
    return NextResponse.json({ error: "Unknown game" }, { status: 400 });
  }

  const isBrowserNavigation =
    req.headers.get("sec-fetch-dest") === "document" ||
    req.headers.get("upgrade-insecure-requests") === "1";
  if (isBrowserNavigation) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const exp = Date.now() + TOKEN_TTL_MS;
  const token = signToken(game, exp);

  return NextResponse.json(
    { token, exp, ttl: TOKEN_TTL_MS },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
