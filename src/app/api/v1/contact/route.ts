import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ContactMessageSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit";

// GET /api/v1/contact (Admin only - list messages)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    ]);

    return NextResponse.json({
      data: messages,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Contact GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contact messages", details: error.message }, { status: 500 });
  }
}

// POST /api/v1/contact (Public form submission)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";

    // Rate limit: 5 messages per 10 minutes per IP
    const rateCheck = checkRateLimit(`contact_${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait before submitting again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = ContactMessageSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        subject: data.subject,
        message: data.message,
        ipAddress: ip,
        status: "UNREAD",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. Our team will review and respond shortly.",
        id: message.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact POST error:", error);
    return NextResponse.json({ error: "Failed to submit contact message", details: error.message }, { status: 500 });
  }
}
