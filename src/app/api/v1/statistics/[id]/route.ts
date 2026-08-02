import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { StatisticSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// PUT /api/v1/statistics/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const parseResult = StatisticSchema.partial().safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.statistic.update({
      where: { id },
      data: parseResult.data,
    });

    await logAuditEvent({
      userId: user.id,
      action: "STATISTIC_UPDATE",
      entity: "Statistic",
      entityId: id,
      details: parseResult.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update statistic", details: error.message }, { status: 500 });
  }
}

// DELETE /api/v1/statistics/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.statistic.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "STATISTIC_DELETE",
      entity: "Statistic",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "Statistic deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete statistic", details: error.message }, { status: 500 });
  }
}
