import crypto from "crypto";
import prisma from "./prisma";
import { sendEmail } from "./email";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;

function hashCode(code: string, email: string): string {
  const key = process.env.JWT_SECRET || "inertiahub_otp_secret";
  return crypto.createHmac("sha256", key).update(`${email.toLowerCase().trim()}|${code}`).digest("hex");
}

export function generateCode(): string {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function issueLoginOtp(email: string): Promise<{ sent: boolean; code?: string }> {
  const normalized = email.toLowerCase().trim();

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Mark previously issued codes for this email as used (single-use).
  await prisma.loginOtp.updateMany({
    where: { email: normalized, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.loginOtp.create({
    data: {
      email: normalized,
      codeHash: hashCode(code, normalized),
      expiresAt,
    },
  });

  const sent = await sendEmail(
    normalized,
    "Your InertiaHub admin login code",
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;color:#e4e4e7;padding:32px;border-radius:16px;border:1px solid #262626">
      <p style="font-size:13px;color:#a1a1aa;margin:0 0 8px">InertiaHub Admin Console</p>
      <h1 style="font-size:18px;margin:0 0 16px;color:#ffffff">Login verification code</h1>
      <p style="font-size:13px;color:#a1a1aa;margin:0 0 20px">Use this code to finish signing in. It expires in 5 minutes.</p>
      <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#ffffff;background:#181818;border:1px solid #262626;border-radius:12px;text-align:center;padding:16px 0">${code}</div>
      <p style="font-size:11px;color:#71717a;margin:20px 0 0">If you didn't request this code, you can safely ignore this email.</p>
    </div>`
  );

  return { sent, code };
}

export async function verifyLoginOtp(email: string, code: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  const otp = await prisma.loginOtp.findFirst({
    where: { email: normalized, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return false;
  if (otp.expiresAt < new Date()) return false;
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return false;

  const candidate = hashCode(code.trim(), normalized);
  const a = Buffer.from(candidate);
  const b = Buffer.from(otp.codeHash);
  const matches = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (matches) {
    await prisma.loginOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
    return true;
  }

  await prisma.loginOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
  return false;
}
