import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { logAuditEvent } from "@/lib/audit";

// DELETE /api/v1/media/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { id } = params;
    const item = await prisma.mediaItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    // Try deleting files from disk
    try {
      const publicPath = path.join(process.cwd(), "public", item.url.replace(/^\//, ""));
      await fs.unlink(publicPath).catch(() => {});
      if (item.thumbnailUrl && item.thumbnailUrl !== item.url) {
        const thumbPath = path.join(process.cwd(), "public", item.thumbnailUrl.replace(/^\//, ""));
        await fs.unlink(thumbPath).catch(() => {});
      }
    } catch (e) {
      // Ignore disk delete errors
    }

    await prisma.mediaItem.delete({ where: { id } });

    await logAuditEvent({
      userId: user.id,
      action: "MEDIA_DELETE",
      entity: "MediaItem",
      entityId: id,
      details: { fileName: item.fileName },
    });

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete media item", details: error.message }, { status: 500 });
  }
}
