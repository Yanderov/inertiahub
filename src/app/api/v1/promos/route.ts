import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function canManage(role?: string) {
  return role === "ADMIN" || role === "EDITOR";
}

function generateCode(prefix: string) {
  const bytes = crypto.randomBytes(8).toString("hex").toUpperCase();
  return `${prefix}-${bytes}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!canManage(user?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json({ data: promos });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!canManage(user?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const prefix = typeof body.prefix === "string" && body.prefix.trim()
      ? body.prefix.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12)
      : "INERTIA";
    const maxUses = body.maxUses === "" || body.maxUses == null ? null : Math.max(1, Number(body.maxUses) || 1);
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 160) : null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const promo = await prisma.promoCode.create({
          data: { code: generateCode(prefix), description, maxUses, expiresAt },
        });
        return NextResponse.json({ data: promo }, { status: 201 });
      } catch (error: any) {
        if (error?.code !== "P2002" || attempt === 2) throw error;
      }
    }
    return NextResponse.json({ error: "Could not generate code" }, { status: 500 });
  } catch (error: any) {
    console.error("Promo create error:", error);
    return NextResponse.json({ error: "Could not generate code" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!canManage(user?.role)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.id !== "string") return NextResponse.json({ error: "id required" }, { status: 400 });
  const promo = await prisma.promoCode.update({ where: { id: body.id }, data: { enabled: Boolean(body.enabled) } });
  return NextResponse.json({ data: promo });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
