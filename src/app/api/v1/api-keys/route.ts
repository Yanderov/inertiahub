import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ApiKeySchema } from "@/lib/validations";
import crypto from "crypto";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/api-keys (Admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data: keys });
  } catch (error: any) {
    console.error("API Keys GET error:", error);
    return NextResponse.json({ error: "Failed to fetch API keys", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/api-keys (Admin generate key)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = ApiKeySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const { name, permissions, expiresInDays } = parseResult.data;

    // Generate secure key: inhub_live_xxx
    const randomSecret = crypto.randomBytes(24).toString("hex");
    const rawKey = `inhub_live_${randomSecret}`;
    const prefix = rawKey.substring(0, 16);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        prefix,
        keyHash,
        permissions,
        expiresAt,
        createdById: user.id,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "API_KEY_CREATE",
      entity: "ApiKey",
      entityId: apiKey.id,
      details: { name: apiKey.name, prefix: apiKey.prefix },
    });

    // Return the RAW unhashed key ONLY once upon creation
    return NextResponse.json(
      {
        success: true,
        data: {
          ...apiKey,
          rawSecretKey: rawKey, // Displayed to admin once
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to generate API key", details: error.message }, { status: 500 });
  }
}
