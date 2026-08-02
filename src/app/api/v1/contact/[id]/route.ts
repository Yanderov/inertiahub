import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/contact/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Mark as read if previously unread
    if (msg.status === "UNREAD") {
      await prisma.contactMessage.update({
        where: { id },
        data: { status: "READ" },
      });
    }

    return NextResponse.json({ data: msg });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch message", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/contact/[id] (Update status, add notes)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const { status, replyNotes } = await req.json();

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: status || undefined,
        replyNotes: replyNotes !== undefined ? replyNotes : undefined,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "CONTACT_MESSAGE_UPDATE",
      entity: "ContactMessage",
      entityId: id,
      details: { status, replyNotes },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update message", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/contact/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.contactMessage.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "CONTACT_MESSAGE_DELETE",
      entity: "ContactMessage",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete message", details: error.message }, { status: 500 });
  }
}
