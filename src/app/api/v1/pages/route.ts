import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PageSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/pages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: pages });
  } catch (error: any) {
    console.error("Pages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pages", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/pages
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = PageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const finalSlug = slugify(data.slug || data.title);

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: finalSlug,
        description: data.description,
        content: data.content || {},
        status: data.status,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        ogImage: data.ogImage,
        authorId: user.id,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "PAGE_CREATE",
      entity: "Page",
      entityId: page.id,
      details: { title: page.title, slug: page.slug },
    });

    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create dynamic page", details: error.message }, { status: 500 });
  }
}
