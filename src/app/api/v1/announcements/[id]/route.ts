import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AnnouncementSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/announcements/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const item = await prisma.announcement.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch announcement", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/announcements/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = AnnouncementSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: any = { ...data };
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updatePayload.endDate = data.endDate ? new Date(data.endDate) : null;

    const updated = await prisma.announcement.update({
      where: { id },
      data: updatePayload,
    });

    await logAuditEvent({
      userId: user.id,
      action: "ANNOUNCEMENT_UPDATE",
      entity: "Announcement",
      entityId: id,
      details: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update announcement", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/announcements/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.announcement.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "ANNOUNCEMENT_DELETE",
      entity: "Announcement",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete announcement", details: error.message }, { status: 500 });
  }
}
