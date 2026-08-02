import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ChangelogSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/changelog/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const release = await prisma.changelog.findFirst({
      where: { OR: [{ id }, { version: id }] },
    });

    if (!release) {
      return NextResponse.json({ error: "Release not found" }, { status: 404 });
    }

    return NextResponse.json({ data: release });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch release", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/changelog/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = ChangelogSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: any = { ...data };
    if (data.releaseDate) {
      updatePayload.releaseDate = new Date(data.releaseDate);
    }

    const updated = await prisma.changelog.update({
      where: { id },
      data: updatePayload,
    });

    await logAuditEvent({
      userId: user.id,
      action: "CHANGELOG_UPDATE",
      entity: "Changelog",
      entityId: id,
      details: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update release", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/changelog/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.changelog.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.id,
      action: "CHANGELOG_DELETE",
      entity: "Changelog",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Release deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete release", details: error.message }, { status: 500 });
  }
}
