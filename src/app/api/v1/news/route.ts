import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NewsSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/news
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (status) {
      where.status = status;
    } else {
      // By default for public requests, show only PUBLISHED
      where.status = "PUBLISHED";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("News GET error:", error);
    return NextResponse.json({ error: "Failed to fetch news", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/news (Admin / Editor)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = NewsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const finalSlug = slugify(data.slug || data.title);

    const newsItem = await prisma.news.create({
      data: {
        title: data.title,
        slug: finalSlug,
        summary: data.summary,
        content: data.content,
        category: data.category,
        coverImage: data.coverImage,
        status: data.status,
        isPinned: data.isPinned,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        authorId: user.id,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "NEWS_CREATE",
      entity: "News",
      entityId: newsItem.id,
      details: { title: newsItem.title, slug: newsItem.slug },
    });

    return NextResponse.json({ success: true, data: newsItem }, { status: 201 });
  } catch (error: any) {
    console.error("News POST error:", error);
    return NextResponse.json({ error: "Failed to create news item", details: error.message }, { status: 500 });
  }
}
