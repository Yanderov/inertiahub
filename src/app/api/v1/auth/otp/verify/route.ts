import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSession, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { verifyLoginOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const rateCheck = checkRateLimit(`otp_verify_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Invalid email or code" }, { status: 401 });
    }

    const valid = await verifyLoginOtp(email, code);
    if (!valid) {
      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_CODE_FAILED",
        entity: "User",
        entityId: user.id,
        details: { reason: "Wrong or expired code" },
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json({ error: "Wrong or expired code" }, { status: 401 });
    }

    const { token } = await createSession(user.id, ip, userAgent);

    await logAuditEvent({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "User",
      entityId: user.id,
      details: { method: "email_otp" },
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
    console.error("OTP verify API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
