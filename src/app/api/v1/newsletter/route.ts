import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NewsletterSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/v1/newsletter (Admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: subscribers, total: subscribers.length });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch subscribers", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/newsletter (Subscribe / Unsubscribe)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    const rateCheck = checkRateLimit(`newsletter_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const parseResult = NewsletterSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const { email, source } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { email: cleanEmail },
          data: { isActive: true, unsubscribedAt: null },
        });
      }
      return NextResponse.json({
        success: true,
        message: "You are already subscribed to InertiaHub platform updates!",
      });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        source: source || "homepage",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to InertiaHub platform updates!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to process newsletter subscription", details: error.message }, { status: 500 });
  }
}
