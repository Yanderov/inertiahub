import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PageSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/pages/[id] (by ID or Slug)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const page = await prisma.page.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Increment views
    await prisma.page.update({
      where: { id: page.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ data: page });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch page", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/pages/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = PageSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: any = { ...data };
    if (data.slug) updatePayload.slug = slugify(data.slug);
    if (data.status === "PUBLISHED" && !data.publishedAt) {
      updatePayload.publishedAt = new Date();
    }

    const updated = await prisma.page.update({
      where: { id },
      data: updatePayload,
    });

    await logAuditEvent({
      userId: user.id,
      action: "PAGE_UPDATE",
      entity: "Page",
      entityId: id,
      details: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update page", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/pages/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.page.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "PAGE_DELETE",
      entity: "Page",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Page deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete page", details: error.message }, { status: 500 });
  }
}
