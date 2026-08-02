import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "./prisma";
import { RoleType } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "inertiahub_fallback_secret_key_2026";
const SESSION_COOKIE_NAME = "inertiahub_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: RoleType;
  name: string;
  sessionId: string;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, reqIp?: string, reqUserAgent?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!user) throw new Error("User not found");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create session in database
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: "", // Will update with signed JWT
      expiresAt,
      ipAddress: reqIp || null,
      userAgent: reqUserAgent || null,
    },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    sessionId: session.id,
  });

  await prisma.session.update({
    where: { id: session.id },
    data: { token },
  });

  return { token, session, user };
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Verify session is active in database
    const dbSession = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            isTwoFactorEnabled: true,
            isEmailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
      return null;
    }

    return dbSession.user;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(allowedRoles?: RoleType[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please log in");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient privileges");
  }

  return user;
}

export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
