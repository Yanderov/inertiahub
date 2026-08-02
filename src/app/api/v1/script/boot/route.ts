import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const hwid = typeof body?.hwid === "string" ? body.hwid.trim().slice(0, 256) : "";
    const robloxId =
      typeof body?.robloxId === "string" ? body.robloxId.trim().slice(0, 32) : "";

    let banned = false;
    let reason = null as string | null;

    const [hwidMatch, robloxMatch] = await Promise.all([
      hwid
        ? prisma.hwidBan.findFirst({ where: { hwid } })
        : Promise.resolve(null),
      robloxId
        ? prisma.hwidBan.findFirst({
            where: { robloxId },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve(null),
    ]);

    const ban = hwidMatch || robloxMatch;
    if (ban) {
      const expired = ban.expiresAt && ban.expiresAt.getTime() < Date.now();
      if (!expired) {
        banned = true;
        reason = ban.reason || "Access revoked";
      }
    }

    const currentVersion = await prisma.scriptVersion.findFirst({
      where: { isCurrent: true },
      orderBy: { updatedAt: "desc" },
    });
    const masterEnabled =
      currentVersion?.enabled ?? (await prisma.scriptVersion.count()) === 0;

    const features = await prisma.scriptFeature.findMany();

    const featureMap: Record<string, boolean> = {};
    features.forEach((f) => {
      featureMap[`${f.game}.${f.key}`] = f.enabled;
    });

    return NextResponse.json({
      success: true,
      banned,
      reason,
      maintenance: !masterEnabled,
      version: currentVersion?.version || "v3.5.0",
      features: featureMap,
    });
  } catch (error: any) {
    console.error("Boot check error:", error);
    return NextResponse.json(
      { success: false, banned: false, maintenance: false, version: "v3.5.0" },
      { status: 200 }
    );
  }
}
