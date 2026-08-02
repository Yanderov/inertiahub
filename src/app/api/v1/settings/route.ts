import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;

    const settings = await prisma.siteSetting.findMany({ where });

    // Format into key-value map for easy consumption
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ data: settingsMap, raw: settings });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings", details: error.message }, { status: 500 });
  }
}

// POST / PUT /api/v1/settings (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { key, value, category } = await req.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value, category: category || "GENERAL" },
      create: { key, value, category: category || "GENERAL" },
    });

    await logAuditEvent({
      userId: user.id,
      action: "SETTING_UPDATE",
      entity: "SiteSetting",
      entityId: setting.id,
      details: { key, value },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save setting", details: error.message }, { status: 500 });
  }
}
