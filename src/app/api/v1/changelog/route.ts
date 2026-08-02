import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ChangelogSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/changelog
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PUBLISHED";

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const releases = await prisma.changelog.findMany({
      where,
      orderBy: { releaseDate: "desc" },
    });

    return NextResponse.json({ data: releases });
  } catch (error: any) {
    console.error("Changelog GET error:", error);
    return NextResponse.json({ error: "Failed to fetch changelog", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/changelog
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = ChangelogSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;

    const release = await prisma.changelog.create({
      data: {
        version: data.version,
        title: data.title,
        description: data.description,
        changes: data.changes,
        status: data.status,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : new Date(),
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "CHANGELOG_CREATE",
      entity: "Changelog",
      entityId: release.id,
      details: { version: release.version, title: release.title },
    });

    return NextResponse.json({ success: true, data: release }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create changelog release", details: error.message }, { status: 500 });
  }
}
