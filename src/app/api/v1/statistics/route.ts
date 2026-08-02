import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatisticSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const where: any = {};
    if (!all) {
      where.isPublic = true;
    }

    const stats = await prisma.statistic.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: stats });
  } catch (error: any) {
    console.error("Statistics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch statistics", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/statistics (Admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = StatisticSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;

    const stat = await prisma.statistic.upsert({
      where: { key: data.key },
      update: data,
      create: data,
    });

    await logAuditEvent({
      userId: user.id,
      action: "STATISTIC_UPSERT",
      entity: "Statistic",
      entityId: stat.id,
      details: { key: stat.key, value: stat.value },
    });

    return NextResponse.json({ success: true, data: stat }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save statistic", details: error.message }, { status: 500 });
  }
}
