import prisma from "./prisma";
import crypto from "crypto";
import { headers } from "next/headers";

export async function recordPageView(path: string) {
  try {
    const reqHeaders = headers();
    const userAgent = reqHeaders.get("user-agent") || "";
    const referrer = reqHeaders.get("referer") || reqHeaders.get("referrer") || null;
    const rawIp =
      reqHeaders.get("x-forwarded-for")?.split(",")[0] ||
      reqHeaders.get("x-real-ip") ||
      "127.0.0.1";

    // Hash IP for privacy (GDPR compliant anonymization)
    const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex").substring(0, 16);

    // Simple device detection
    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet|ipad/i.test(userAgent)) device = "Tablet";

    // Simple browser detection
    let browser = "Other";
    if (/chrome/i.test(userAgent)) browser = "Chrome";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent)) browser = "Safari";
    else if (/edge/i.test(userAgent)) browser = "Edge";

    // Simple OS detection
    let os = "Other";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
    else if (/linux/i.test(userAgent)) os = "Linux";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

    await prisma.pageAnalytic.create({
      data: {
        path,
        referrer,
        userAgent: userAgent.substring(0, 255),
        ipHash,
        country: "Global",
        device,
        browser,
        os,
      },
    });
  } catch (error) {
    // Non-blocking for page loads
    console.error("Analytics recording error:", error);
  }
}
