import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BlogPostSchema } from "@/lib/validations";
import { slugify, calculateReadingTime } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/blog/[id] (by ID or Slug)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ data: post });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch blog post", details: error.message }, { status: 500 });
  }
}

// PUT /api/v1/blog/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = BlogPostSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: any = { ...data };
    if (data.slug) {
      updatePayload.slug = slugify(data.slug);
    }
    if (data.content && !data.readingTime) {
      updatePayload.readingTime = calculateReadingTime(data.content);
    }
    if (data.publishedAt) {
      updatePayload.publishedAt = new Date(data.publishedAt);
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updatePayload,
    });

    await logAuditEvent({
      userId: user.id,
      action: "BLOG_UPDATE",
      entity: "BlogPost",
      entityId: id,
      details: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update blog post", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/blog/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.blogPost.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.id,
      action: "BLOG_DELETE",
      entity: "BlogPost",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete blog post", details: error.message }, { status: 500 });
  }
}
