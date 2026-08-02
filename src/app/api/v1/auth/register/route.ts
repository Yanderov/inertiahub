import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const rateCheck = checkRateLimit(`register_${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = RegisterSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: "USER",
        isEmailVerified: true, // Default to true for easy access
      },
    });

    const { token } = await createSession(user.id, ip, userAgent);

    await logAuditEvent({
      userId: user.id,
      action: "USER_REGISTER",
      entity: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
