import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const banned = Boolean(body.banned);

    const hubUser = await prisma.hubUser.findUnique({
      where: { id: params.id },
    });
    if (!hubUser) {
      return NextResponse.json({ error: "Hub user not found" }, { status: 404 });
    }

    await prisma.hubUser.update({
      where: { id: hubUser.id },
      data: { banned },
    });

    if (banned) {
      const existing = await prisma.hwidBan.findFirst({
        where: { hwid: hubUser.hwid || hubUser.robloxId },
      });
      if (existing) {
        await prisma.hwidBan.update({
          where: { id: existing.id },
          data: { robloxId: hubUser.robloxId, reason: body.reason || "Banned by admin" },
        });
      } else {
        await prisma.hwidBan.create({
          data: {
            hwid: hubUser.hwid || hubUser.robloxId,
            robloxId: hubUser.robloxId,
            reason: body.reason || "Banned by admin",
            bannedBy: admin.id,
          },
        });
      }
    } else {
      await prisma.hwidBan.deleteMany({
        where: {
          OR: [
            { hwid: hubUser.hwid || hubUser.robloxId },
            { robloxId: hubUser.robloxId },
          ],
        },
      });
    }

    await logAuditEvent({
      userId: admin.id,
      action: banned ? "HUB_USER_BANNED" : "HUB_USER_UNBANNED",
      entity: "HubUser",
      entityId: hubUser.robloxId,
      details: { username: hubUser.username },
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true, banned });
  } catch (error: any) {
    console.error("Hub user ban error:", error);
    return NextResponse.json({ error: "Failed to update ban state" }, { status: 500 });
  }
}
