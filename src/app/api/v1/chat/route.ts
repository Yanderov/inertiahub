import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_CHANNELS = ["mm2", "pressure", "demonology", "universal", "global"];
const MAX_CONTENT = 500;
const MAX_SENDER = 32;

function sanitizeContent(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, MAX_CONTENT);
}

function sanitizeSender(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, MAX_SENDER);
}

async function createMessage(channel: string, sender: string, content: string) {
  const recent = await prisma.chatMessage.findFirst({
    where: {
      channel,
      sender,
      content,
      createdAt: { gte: new Date(Date.now() - 1000) },
    },
    orderBy: { createdAt: "desc" },
  });

  return recent ?? prisma.chatMessage.create({ data: { channel, sender, content } });
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const params = req.nextUrl.searchParams;
    const sender = sanitizeSender(params.get("sender"));
    const content = sanitizeContent(params.get("content"));
    const channel = VALID_CHANNELS.includes(params.get("channel") || "") ? params.get("channel")! : "mm2";

    // Send mode: sender + content present
    if (sender && content) {
      const rate = checkRateLimit(`chat:${ip}`, { limit: 20, windowMs: 60 * 1000 });
      if (!rate.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
      const message = await createMessage(channel, sender, content);
      return NextResponse.json({
        success: true,
        data: { id: message.id, sender, content, kind: message.kind, duration: message.duration, t: message.createdAt.getTime() },
      });
    }

    // Fetch mode
    const after = Number(params.get("after")) || 0;
    const messages = await prisma.chatMessage.findMany({
      where: { channel, createdAt: after > 0 ? { gt: new Date(after) } : undefined },
      orderBy: { createdAt: "asc" },
      take: 100,
      select: { id: true, sender: true, content: true, kind: true, duration: true, createdAt: true },
    });

    return NextResponse.json({
      data: messages.map((m) => ({
        id: m.id, sender: m.sender, content: m.content, kind: m.kind, duration: m.duration, t: m.createdAt.getTime(),
      })),
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rate = checkRateLimit(`chat:${ip}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rate.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const channel = VALID_CHANNELS.includes(body?.channel) ? body.channel : "mm2";
    const sender = sanitizeSender(body?.sender);
    const content = sanitizeContent(body?.content);
    if (!content || !sender) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }
    const message = await createMessage(channel, sender, content);
    return NextResponse.json({
      success: true,
      data: { id: message.id, sender, content, kind: message.kind, duration: message.duration, t: message.createdAt.getTime() },
    });
  } catch (error: any) {
    console.error("Chat send error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
