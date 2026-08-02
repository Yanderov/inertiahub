import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const raw = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const ip = raw.split(",")[0].trim();
  const normalized = ip.toLowerCase().startsWith("::ffff:")
    ? ip.slice(7)
    : ip;

  const allowlist = (process.env.ALLOWED_ADMIN_IPS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return NextResponse.json({
    ip,
    normalized,
    allowed: allowlist.includes(normalized.toLowerCase()) || allowlist.includes(ip.toLowerCase()),
    allowlist,
  });
}
