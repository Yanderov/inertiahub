import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/users/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isTwoFactorEnabled: true,
        isEmailVerified: true,
        createdAt: true,
        sessions: {
          select: { id: true, ipAddress: true, userAgent: true, expiresAt: true, createdAt: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: targetUser });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch user", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/users/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, role, email, password, avatar } = body;

    const updatePayload: any = {};
    if (name) updatePayload.name = name;
    if (role) updatePayload.role = role;
    if (email) updatePayload.email = email.toLowerCase().trim();
    if (avatar !== undefined) updatePayload.avatar = avatar;
    if (password) {
      updatePayload.passwordHash = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updatePayload,
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: "USER_UPDATE_BY_ADMIN",
      entity: "User",
      entityId: id,
      details: { role, email, nameUpdated: !!name },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update user", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    if (user.id === id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "USER_DELETE",
      entity: "User",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete user", details: error.message }, { status: 500 });
  }
}
