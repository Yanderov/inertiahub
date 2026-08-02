import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/v1/analytics (Admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      recentViews,
      topPagesRaw,
      deviceCountsRaw,
      browserCountsRaw,
      recentLogs,
    ] = await Promise.all([
      prisma.pageAnalytic.count(),
      prisma.pageAnalytic.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        select: { timestamp: true, ipHash: true },
      }),
      prisma.pageAnalytic.groupBy({
        by: ["path"],
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
      prisma.pageAnalytic.groupBy({
        by: ["device"],
        _count: { device: true },
      }),
      prisma.pageAnalytic.groupBy({
        by: ["browser"],
        _count: { browser: true },
      }),
      prisma.pageAnalytic.findMany({
        orderBy: { timestamp: "desc" },
        take: 15,
      }),
    ]);

    // Aggregate daily traffic for the past 7 days
    const dailyMap: Record<string, { views: number; visitors: Set<string> }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      dailyMap[dateKey] = { views: 0, visitors: new Set() };
    }

    recentViews.forEach((v) => {
      const dateKey = v.timestamp.toISOString().split("T")[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].views += 1;
        if (v.ipHash) dailyMap[dateKey].visitors.add(v.ipHash);
      }
    });

    const chartData = Object.keys(dailyMap).map((date) => ({
      date,
      views: dailyMap[date].views,
      visitors: dailyMap[date].visitors.size,
    }));

    return NextResponse.json({
      summary: {
        totalViews,
        past7DaysViews: recentViews.length,
        topPages: topPagesRaw.map((p) => ({ path: p.path, count: p._count.path })),
        devices: deviceCountsRaw.map((d) => ({ name: d.device || "Unknown", value: d._count.device })),
        browsers: browserCountsRaw.map((b) => ({ name: b.browser || "Unknown", value: b._count.browser })),
      },
      chartData,
      recentLogs,
    });
  } catch (error: any) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/analytics (Public client tracking)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";
    const referrer = body.referrer || undefined;

    // We can call our analytics recording helper or prisma directly
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    
    // Hash IP for privacy
    const crypto = await import("crypto");
    const ipHash = crypto.createHash("sha256").update(ip + "salt").digest("hex").substring(0, 16);

    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet|ipad/i.test(userAgent)) device = "Tablet";

    let browser = "Other";
    if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
    else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";
    else if (/edg/i.test(userAgent)) browser = "Edge";

    await prisma.pageAnalytic.create({
      data: {
        path,
        referrer,
        ipHash,
        userAgent: userAgent.substring(0, 255),
        device,
        browser,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

