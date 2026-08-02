import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_OPTIONS.name)?.value;

    if (token) {
      const payload = verifyToken(token);
      if (payload?.sessionId) {
        await prisma.session.deleteMany({
          where: { id: payload.sessionId },
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set({
      ...SESSION_COOKIE_OPTIONS,
      value: "",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.set({ ...SESSION_COOKIE_OPTIONS, value: "", maxAge: 0 });
    return response;
  }
}
