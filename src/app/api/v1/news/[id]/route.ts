import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NewsSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/news/[id] (by ID or Slug)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const item = await prisma.news.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 });
    }

    // Increment views
    await prisma.news.update({
      where: { id: item.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ data: item });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch news item", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/news/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = NewsSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: any = { ...data };
    if (data.slug) {
      updatePayload.slug = slugify(data.slug);
    }
    if (data.publishedAt) {
      updatePayload.publishedAt = new Date(data.publishedAt);
    }

    const updated = await prisma.news.update({
      where: { id },
      data: updatePayload,
    });

    await logAuditEvent({
      userId: user.id,
      action: "NEWS_UPDATE",
      entity: "News",
      entityId: id,
      details: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update news item", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/news/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.news.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.id,
      action: "NEWS_DELETE",
      entity: "News",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "News item deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete news item", details: error.message }, { status: 500 });
  }
}
