import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("2FA disable error:", error);
    return NextResponse.json({ error: "Failed to disable 2FA" }, { status: 500 });
  }
}
