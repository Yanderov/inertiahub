import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BlogPostSchema } from "@/lib/validations";
import { slugify, calculateReadingTime } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/blog
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const status = searchParams.get("status") || "PUBLISHED";
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: any = { status };
    if (tag) {
      where.tags = { has: tag };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Blog GET error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/blog (Admin / Editor)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = BlogPostSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const finalSlug = slugify(data.slug || data.title);
    const readingTime = data.readingTime || calculateReadingTime(data.content);

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        coverImage: data.coverImage,
        readingTime,
        status: data.status,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        authorId: user.id,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "BLOG_CREATE",
      entity: "BlogPost",
      entityId: post.id,
      details: { title: post.title, slug: post.slug },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) {
    console.error("Blog POST error:", error);
    return NextResponse.json({ error: "Failed to create blog post", details: error.message }, { status: 500 });
  }
}
