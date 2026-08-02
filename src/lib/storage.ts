import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export interface ProcessedUpload {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  folder: string;
}

export async function processAndSaveFile(
  file: File,
  folder: string = "general"
): Promise<ProcessedUpload> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const safeFolder = folder.replace(/[^a-zA-Z0-9_\-]/g, "") || "general";
  const targetDir = path.join(UPLOAD_DIR, safeFolder);
  const thumbsDir = path.join(targetDir, "thumbnails");

  await fs.mkdir(targetDir, { recursive: true });
  await fs.mkdir(thumbsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(file.name).toLowerCase() || (file.type === "image/png" ? ".png" : ".jpg");
  const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_\-]/g, "-");
  const uniqueFileName = `${baseName}-${fileHash}${ext}`;
  const filePath = path.join(targetDir, uniqueFileName);

  let width: number | undefined;
  let height: number | undefined;
  let thumbnailUrl: string | undefined;

  // Process image if applicable
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      width = metadata.width;
      height = metadata.height;

      // Save original or slightly optimized
      await fs.writeFile(filePath, buffer);

      // Generate optimized thumbnail
      const thumbFileName = `thumb-${uniqueFileName}.webp`;
      const thumbPath = path.join(thumbsDir, thumbFileName);
      await image
        .resize(320, 240, { fit: "cover", position: "center" })
        .webp({ quality: 80 })
        .toFile(thumbPath);

      thumbnailUrl = `/uploads/${safeFolder}/thumbnails/${thumbFileName}`;
    } catch (e) {
      // If sharp fails, save buffer directly
      await fs.writeFile(filePath, buffer);
    }
  } else {
    // Other file types (PDF, SVG, Video)
    await fs.writeFile(filePath, buffer);
  }

  return {
    fileName: uniqueFileName,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    width,
    height,
    url: `/uploads/${safeFolder}/${uniqueFileName}`,
    thumbnailUrl: thumbnailUrl || `/uploads/${safeFolder}/${uniqueFileName}`,
    folder: safeFolder,
  };
}
