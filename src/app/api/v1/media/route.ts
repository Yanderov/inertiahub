import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { processAndSaveFile } from "@/lib/storage";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/media (List media library)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const mimeType = searchParams.get("mimeType");

    const where: any = {};
    if (folder && folder !== "all") where.folder = folder;
    if (mimeType) where.mimeType = { startsWith: mimeType };

    const items = await prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: items });
  } catch (error: any) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Failed to fetch media", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/media (Upload file)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const customName = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const processed = await processAndSaveFile(file, folder);

    const mediaItem = await prisma.mediaItem.create({
      data: {
        name: customName || processed.originalName,
        fileName: processed.fileName,
        originalName: processed.originalName,
        mimeType: processed.mimeType,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        url: processed.url,
        thumbnailUrl: processed.thumbnailUrl,
        folder: processed.folder,
        uploaderId: user.id,
      },
    });

    await logAuditEvent({
      userId: user.id,
      action: "MEDIA_UPLOAD",
      entity: "MediaItem",
      entityId: mediaItem.id,
      details: { fileName: mediaItem.fileName, size: mediaItem.size },
    });

    return NextResponse.json({ success: true, data: mediaItem }, { status: 201 });
  } catch (error: any) {
    console.error("Media POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
