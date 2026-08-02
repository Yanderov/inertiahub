import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { verifyTwoFactorToken } from "@/lib/totp";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, disable } = await req.json();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA is not set up" }, { status: 400 });
    }

    const isValid = verifyTwoFactorToken(token, dbUser.twoFactorSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (disable) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isTwoFactorEnabled: false, twoFactorSecret: null },
      });
      await logAuditEvent({
        userId: user.id,
        action: "2FA_DISABLED",
        entity: "User",
        entityId: user.id,
      });
      return NextResponse.json({ success: true, message: "2FA has been disabled" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isTwoFactorEnabled: true },
    });

    await logAuditEvent({
      userId: user.id,
      action: "2FA_ENABLED",
      entity: "User",
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication successfully enabled",
    });
  } catch (error: any) {
    console.error("2FA verify error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
