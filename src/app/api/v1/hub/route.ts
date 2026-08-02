import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// GET /api/v1/hub — full hub state for the control panel
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [versions, features, bans, logs, chat, settings, onlineUsers] = await Promise.all([
      prisma.scriptVersion.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.scriptFeature.findMany({ orderBy: [{ game: "asc" }, { key: "asc" }] }),
      prisma.hwidBan.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.scriptLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.chatMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.siteSetting.findMany({
        where: {
          OR: [{ key: "hub.chatChannel" }, { key: "hub.maintenance" }],
        },
      }),
      prisma.hubUser.findMany({
        where: { lastSeen: { gte: new Date(Date.now() - 45 * 1000) } },
        orderBy: { lastSeen: "desc" },
        take: 100,
        select: { robloxId: true, username: true, game: true, placeId: true, lastSeen: true },
      }),
    ]);

    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      versions,
      features,
      bans,
      logs,
      chat,
      onlineUsers,
      chatChannel: settingsMap["hub.chatChannel"] || "mm2",
    });
  } catch (error: any) {
    console.error("Hub GET error:", error);
    return NextResponse.json(
      { error: "Failed to load hub state", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/v1/hub — action dispatch (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;
    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    switch (action) {
      // ---- Versions ----
      case "setVersion": {
        const { id } = body;
        if (typeof id !== "string") throw new Error("id required");
        await prisma.$transaction([
          prisma.scriptVersion.updateMany({ data: { isCurrent: false } }),
          prisma.scriptVersion.update({ where: { id }, data: { isCurrent: true } }),
        ]);
        break;
      }
      case "createVersion": {
        const { version, title, notes, enabled } = body;
        if (typeof version !== "string" || !version.trim()) throw new Error("version required");
        await prisma.scriptVersion.create({
          data: {
            version: version.trim(),
            title: typeof title === "string" ? title : null,
            notes: typeof notes === "string" ? notes : null,
            enabled: enabled !== false,
            isCurrent: (await prisma.scriptVersion.count()) === 0,
          },
        });
        break;
      }
      case "toggleVersion": {
        const { id, enabled } = body;
        if (typeof id !== "string") throw new Error("id required");
        await prisma.scriptVersion.update({ where: { id }, data: { enabled: !!enabled } });
        break;
      }

      // ---- Features ----
      case "upsertFeature": {
        const { game, key, label, enabled } = body;
        if (typeof game !== "string" || typeof key !== "string" || !game || !key) {
          throw new Error("game and key required");
        }
        await prisma.scriptFeature.upsert({
          where: { game_key: { game, key } },
          update: { label: typeof label === "string" ? label : key, enabled: enabled !== false },
          create: { game, key, label: typeof label === "string" ? label : key, enabled: enabled !== false },
        });
        break;
      }
      case "deleteFeature": {
        const { game, key } = body;
        if (typeof game !== "string" || typeof key !== "string") throw new Error("game and key required");
        await prisma.scriptFeature.deleteMany({ where: { game, key } });
        break;
      }

      // ---- Hub settings ----
      case "setSetting": {
        const { key, value } = body;
        if (typeof key !== "string" || value === undefined) throw new Error("key and value required");
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
        break;
      }

      // ---- HWID bans ----
      case "addBan": {
        const { hwid, robloxId, reason, expiresAt } = body;
        if (!hwid && !robloxId) throw new Error("hwid or robloxId required");
        await prisma.hwidBan.create({
          data: {
            hwid: typeof hwid === "string" ? hwid : "",
            robloxId: typeof robloxId === "string" ? robloxId : null,
            reason: typeof reason === "string" ? reason : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            bannedBy: user.email,
          },
        });
        break;
      }
      case "removeBan": {
        const { id } = body;
        if (typeof id !== "string") throw new Error("id required");
        await prisma.hwidBan.delete({ where: { id } });
        break;
      }

      // ---- Chat moderation ----
      case "deleteChat": {
        const { id } = body;
        if (typeof id !== "string") throw new Error("id required");
        await prisma.chatMessage.delete({ where: { id } });
        break;
      }
      case "clearChat": {
        const { channel } = body;
        await prisma.chatMessage.deleteMany({
          where: typeof channel === "string" ? { channel } : {},
        });
        break;
      }

      case "sendAnnouncement": {
        const { message, duration } = body;
        if (typeof message !== "string" || !message.trim()) throw new Error("message required");
        const content = message.trim().slice(0, 500);
        const displayDuration = Math.min(Math.max(Number(duration) || 6, 2), 60);
        await prisma.chatMessage.create({
          data: { channel: "global", sender: "SYSTEM", content, kind: "announcement", duration: displayDuration },
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await logAuditEvent({
      userId: user.id,
      action: "HUB_ACTION",
      entity: "Hub",
      details: body,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Hub POST error:", error);
    return NextResponse.json(
      { error: "Action failed", details: error.message },
      { status: 500 }
    );
  }
}
