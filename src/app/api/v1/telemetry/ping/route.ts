import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_GAMES = ["MM2", "Pressure", "Demonology", "Loader", "Universal"];

function normalizeGame(game: string | undefined): string {
  if (!game) return "Universal";
  const key = VALID_GAMES.find(
    (g) => g.toLowerCase() === String(game).toLowerCase()
  );
  return key || "Universal";
}

function normalizeExecutor(executor: string | undefined): string {
  const value = String(executor || "").trim();
  if (!value || value === "Unknown") return "Unknown";
  return value.slice(0, 64);
}

function sanitizeString(value: unknown, maxLen = 128): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const body = await req.json().catch(() => ({}));
    const userId = String(body?.userId ?? "").trim();
    if (!userId || userId === "0" || userId === "nil" || !/^\d+$/.test(userId)) {
      return NextResponse.json({ error: "Invalid Roblox User ID" }, { status: 400 });
    }

    const game = normalizeGame(body?.game);
    const executor = normalizeExecutor(body?.executor);
    const username = sanitizeString(body?.username);
    const hwid = sanitizeString(body?.hwid);
    const placeId = sanitizeString(body?.placeId);
    const version = sanitizeString(body?.version, 32);

    const now = new Date();

    const hubUser = await prisma.hubUser.upsert({
      where: { robloxId: userId },
      create: {
        robloxId: userId,
        username,
        hwid,
        executor,
        game,
        placeId,
        injections: 1,
        firstSeen: now,
        lastSeen: now,
      },
      update: {
        username: username ?? undefined,
        hwid: hwid ?? undefined,
        executor: executor ?? undefined,
        game: game ?? undefined,
        placeId: placeId ?? undefined,
        injections: { increment: 1 },
        lastSeen: now,
      },
    });

    await prisma.scriptLog.create({
      data: {
        robloxId: userId,
        username,
        game,
        hwid,
        executor,
        version,
        placeId,
        ipAddress: ip,
      },
    });

    const totalInjections = await prisma.hubUser.aggregate({
      _sum: { injections: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        uniqueUsers: await prisma.hubUser.count(),
        totalInjections: totalInjections._sum.injections || 0,
        isNewUser: hubUser.injections === 1,
      },
    });
  } catch (error: any) {
    console.error("Telemetry API error:", error);
    return NextResponse.json(
      { error: "Failed to record telemetry", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [uniqueUsers, activeLast24h, totalInjections, byGame, byExecutor] =
      await Promise.all([
        prisma.hubUser.count(),
        prisma.hubUser.count({
          where: { lastSeen: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        }),
        prisma.hubUser.aggregate({ _sum: { injections: true } }),
        prisma.hubUser.groupBy({ by: ["game"], _count: { _all: true } }),
        prisma.hubUser.groupBy({ by: ["executor"], _count: { _all: true } }),
      ]);

    const byGameMap: Record<string, number> = {};
    byGame.forEach((row) => {
      byGameMap[row.game || "Universal"] = row._count._all;
    });

    const byExecutorMap: Record<string, number> = {};
    byExecutor.forEach((row) => {
      byExecutorMap[row.executor || "Unknown"] = row._count._all;
    });

    return NextResponse.json({
      uniqueUsers,
      totalInjections: totalInjections._sum.injections || 0,
      activeLast24h,
      updatesCount: await prisma.changelog.count(),
      byGame: byGameMap,
      byExecutor: byExecutorMap,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Telemetry read error:", error);
    return NextResponse.json(
      { error: "Failed to read telemetry", details: error.message },
      { status: 500 }
    );
  }
}
