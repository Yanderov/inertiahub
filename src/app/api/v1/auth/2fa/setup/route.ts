import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateTwoFactorSecret, generateQrCodeDataUrl } from "@/lib/totp";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { secret, otpauth } = generateTwoFactorSecret(user.email, "InertiaHub");
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauth);

    // Save temporary secret to user record until verified
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({
      secret,
      qrCodeDataUrl,
    });
  } catch (error: any) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup two-factor authentication", details: error.message },
      { status: 500 }
    );
  }
}
