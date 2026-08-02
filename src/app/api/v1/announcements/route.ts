import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AnnouncementSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/announcements
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const where: any = {};
    if (!all) {
      where.isActive = true;
      const now = new Date();
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ];
    }

    const items = await prisma.announcement.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ data: items });
  } catch (error: any) {
    console.error("Announcements GET error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/announcements
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = AnnouncementSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;

    const item = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        link: data.link,
        linkText: data.linkText,
        isActive: data.isActive,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "ANNOUNCEMENT_CREATE",
      entity: "Announcement",
      entityId: item.id,
      details: { title: item.title },
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create announcement", details: error.message }, { status: 500 });
  }
}
