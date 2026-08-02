import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

// DELETE /api/v1/api-keys/[id] (Revoke)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    await prisma.apiKey.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "API_KEY_REVOKE",
      entity: "ApiKey",
      entityId: id,
    });

    return NextResponse.json({ success: true, message: "API key revoked successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to revoke API key", details: error.message }, { status: 500 });
  }
}
