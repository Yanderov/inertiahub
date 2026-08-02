import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const search = req.nextUrl.searchParams.get("search")?.trim().toLowerCase() || "";
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 200, 500);

    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" as const } },
            { robloxId: { contains: search } },
            { hwid: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      prisma.hubUser.findMany({
        where,
        orderBy: { lastSeen: "desc" },
        take: limit,
      }),
      prisma.hubUser.count({ where }),
    ]);

    return NextResponse.json({ data: users, pagination: { total, limit } });
  } catch (error: any) {
    console.error("Hub users error:", error);
    return NextResponse.json({ error: "Failed to load hub users" }, { status: 500 });
  }
}
