import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_MIRROR = "https://raw.githubusercontent.com/Yanderov/lib/main/assets/";
const IY_MIRROR = "https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".rbxm": "application/octet-stream",
  ".rbxmx": "application/octet-stream",
  ".txt": "text/plain",
  ".json": "application/json",
  ".lua": "text/plain",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

function guessMime(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return MIME[ext] || "application/octet-stream";
}

function safeSegment(seg: string): string {
  return seg.replace(/\.\./g, "").replace(/[\\/]/g, "_").replace(/^_+/, "").slice(0, 120);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = (params.path || []).map(safeSegment).filter(Boolean);
    const rel = segments.join("/");
    if (!rel) return new NextResponse("Not found", { status: 404 });

    // 1) Serve a locally-hosted copy first (public/assets/...)
    const localPath = path.join(process.cwd(), "public", "assets", ...segments);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      const data = fs.readFileSync(localPath);
      return new NextResponse(data, {
        headers: {
          "Content-Type": guessMime(rel),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 2) Fallback: mirror from the canonical source so existing features keep working
    const mirror =
      rel === "iy/source"
        ? IY_MIRROR
        : GITHUB_MIRROR + encodeURI(rel);

    const upstream = await fetch(mirror, {
      headers: { "User-Agent": "inertiahub-cdn" },
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok) return new NextResponse("Not found", { status: 404 });

    const buf = Buffer.from(await upstream.arrayBuffer());
    return new NextResponse(buf, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || guessMime(rel),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Asset proxy error:", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
