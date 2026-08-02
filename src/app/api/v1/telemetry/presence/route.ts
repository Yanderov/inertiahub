import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const VALID_GAMES = new Set(["MM2", "Pressure", "Demonology", "Universal"]);
const DEFAULT_WINDOW_SECONDS = 45;

function clean(value: string | null, max = 128): string | null {
  if (!value) return null;
  const result = value.trim().slice(0, max);
  return result || null;
}

function gameName(value: string | null): string {
  if (!value) return "Universal";
  for (const game of VALID_GAMES) {
    if (game.toLowerCase() === value.toLowerCase()) return game;
  }
  return "Universal";
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const userId = clean(params.get("userId"), 32);
    const username = clean(params.get("username"), 64);
    const game = gameName(params.get("game"));
    const placeId = clean(params.get("placeId"), 32);

    // A userId query is a lightweight heartbeat. It never stores secrets.
    if (userId) {
      if (!/^\d+$/.test(userId)) {
        return NextResponse.json({ error: "Invalid Roblox User ID" }, { status: 400 });
      }

      const now = new Date();
      await prisma.hubUser.upsert({
        where: { robloxId: userId },
        create: {
          robloxId: userId,
          username,
          game,
          placeId,
          injections: 1,
          firstSeen: now,
          lastSeen: now,
        },
        update: {
          username: username ?? undefined,
          game,
          placeId: placeId ?? undefined,
          lastSeen: now,
        },
      });

      return NextResponse.json({ ok: true, t: now.getTime() }, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    const requestedGame = params.get("game");
    const whereGame = requestedGame ? gameName(requestedGame) : undefined;
    const requestedWindow = Number(params.get("window"));
    const windowSeconds = Number.isFinite(requestedWindow)
      ? Math.min(Math.max(requestedWindow, 10), 180)
      : DEFAULT_WINDOW_SECONDS;
    const since = new Date(Date.now() - windowSeconds * 1000);

    const users = await prisma.hubUser.findMany({
      where: {
        lastSeen: { gte: since },
        game: whereGame,
      },
      orderBy: { lastSeen: "desc" },
      take: 100,
      select: {
        robloxId: true,
        username: true,
        game: true,
        placeId: true,
        lastSeen: true,
      },
    });

    return NextResponse.json({
      data: users.map((user) => ({
        userId: user.robloxId,
        username: user.username,
        game: user.game,
        placeId: user.placeId,
        lastSeen: user.lastSeen.getTime(),
      })),
      windowSeconds,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("Presence API error:", error);
    return NextResponse.json({ data: [], error: "Presence unavailable" }, { status: 200 });
  }
}
