import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { verifyTwoFactorToken } from "@/lib/totp";
import { issueLoginOtp } from "@/lib/otp";
import { LoginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // Rate limit: 10 attempts per minute per IP
    const rateCheck = checkRateLimit(`login_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid login payload", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, twoFactorCode } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Admin/Editor accounts authenticate with a one-time email code (password is the code).
    if (user.role === "ADMIN" || user.role === "EDITOR") {
      const { sent } = await issueLoginOtp(user.email);
      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_CODE_SENT",
        entity: "User",
        entityId: user.id,
        details: { sent },
        ipAddress: ip,
        userAgent,
      });
      if (!sent) {
        return NextResponse.json(
          { error: "Could not send login code. Try again in a moment." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { requireEmailOtp: true, message: "Login code sent to your email" },
        { status: 200 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "User",
        entityId: user.id,
        details: { reason: "Invalid password" },
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { requireTwoFactor: true, message: "Two-factor authentication code required" },
          { status: 200 }
        );
      }

      const isTwoFactorValid = verifyTwoFactorToken(twoFactorCode, user.twoFactorSecret);
      if (!isTwoFactorValid) {
        return NextResponse.json({ error: "Invalid two-factor authentication code" }, { status: 401 });
      }
    }

    // Create session
    const { token, user: sessionUser } = await createSession(user.id, ip, userAgent);

    await logAuditEvent({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
