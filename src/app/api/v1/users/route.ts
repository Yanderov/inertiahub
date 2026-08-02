import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { RegisterSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/users (Admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: any = {};
    if (role && role !== "ALL") where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isTwoFactorEnabled: true,
        isEmailVerified: true,
        createdAt: true,
        _count: {
          select: { news: true, blogPosts: true, pages: true, sessions: true },
        },
      },
    });

    return NextResponse.json({ data: users });
  } catch (error: any) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/users (Admin create user)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = RegisterSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Validation failed", details: parseResult.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = parseResult.data;
    const role = body.role || "USER";

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        isEmailVerified: true,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: "USER_CREATE_BY_ADMIN",
      entity: "User",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create user", details: error.message }, { status: 500 });
  }
}
