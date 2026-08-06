import { NextRequest, NextResponse } from "next/server";

// In-memory sliding window rate limiter for DDoS mitigation
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 60 seconds
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    });
  }
}

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInSec: number } {
  cleanupRateLimits();
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const resetInSec = Math.ceil((record.resetAt - now) / 1000);

  return {
    allowed: record.count <= limit,
    remaining,
    resetInSec,
  };
}

export async function middleware(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";
  const path = req.nextUrl.pathname;

  const isAdminPage = path === "/admin" || path.startsWith("/admin/") || path === "/admin/login";
  const adminApiPrefixes = [
    "/api/v1/analytics", "/api/v1/announcements",
    "/api/v1/audit-logs", "/api/v1/blog", "/api/v1/changelog", "/api/v1/media",
    "/api/v1/news", "/api/v1/pages", "/api/v1/promos", "/api/v1/settings",
    "/api/v1/statistics", "/api/v1/system", "/api/v1/users", "/api/v1/telemetry/users",
    "/api/v1/contact/", "/api/v1/hub",
  ];
  const isAdminApi = adminApiPrefixes.some((prefix) => path.startsWith(prefix));

  if (isAdminPage || isAdminApi) {
    const normalizedIp = ip.toLowerCase().startsWith("::ffff:") ? ip.slice(7) : ip;
    const defaultAllowed = ["100.6.139.246", "2600:4041:c3:e800:e52e:d9fd:32cd:ee13", "127.0.0.1", "::1"];
    const envAllowed = (process.env.ALLOWED_ADMIN_IPS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const allowlist = Array.from(new Set([...defaultAllowed.map((s) => s.toLowerCase()), ...envAllowed]));

    const ipLower = ip.toLowerCase();
    const v6prefix = (addr: string) => addr.split(":").slice(0, 4).join(":");
    const v6Allowed =
      normalizedIp.toLowerCase().includes(":") &&
      allowlist.some((entry) => entry.includes(":") && v6prefix(entry) === v6prefix(normalizedIp.toLowerCase()));
    const allowed = allowlist.includes(ipLower) || allowlist.includes(normalizedIp.toLowerCase()) || v6Allowed;

    if (!allowed) {
      if (isAdminPage) {
        return new NextResponse(
          `<!DOCTYPE html><html><head><title>403 Forbidden</title><style>body{background:#0a0a0a;color:#eee;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}div{text-align:center;padding:24px;border:1px solid #222;border-radius:12px;background:#111;max-width:400px}h1{font-size:20px;font-weight:600;margin:0 0 8px 0;color:#fff}p{color:#777;font-size:13px;margin:0;line-height:1.5}</style></head><body><div><h1>403 Forbidden</h1><p>Access restricted to authorized network administrators only.</p></div></body></html>`,
          {
            status: 403,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          }
        );
      }
      return new NextResponse(JSON.stringify({ error: "Forbidden: IP Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 1. Strict Auth Rate Limiting (Brute Force Defense)
  if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/register")) {
    const authLimit = checkRateLimit(`auth:${ip}`, 10, 60 * 1000); // 10 attempts per minute
    if (!authLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Too many authentication attempts. Please wait a minute before retrying.",
          retryAfter: authLimit.resetInSec,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(authLimit.resetInSec),
          },
        }
      );
    }
  }

  // 2. Telemetry Ping Rate Limiting
  if (path.startsWith("/api/v1/telemetry")) {
    const telemetryLimit = checkRateLimit(`telemetry:${ip}`, 60, 60 * 1000); // 60 pings/min
    if (!telemetryLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(telemetryLimit.resetInSec),
          },
        }
      );
    }
  }

  // 2.5 Script payload rate limiting (anti-scraping)
  if (path.startsWith("/api/v1/script/token")) {
    const tokenLimit = checkRateLimit(`scriptToken:${ip}`, 20, 60 * 1000);
    if (!tokenLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(tokenLimit.resetInSec),
          },
        }
      );
    }
  }
  if (path.startsWith("/api/v1/script/") && !path.startsWith("/api/v1/script/token")) {
    const scriptLimit = checkRateLimit(`script:${ip}`, 30, 60 * 1000);
    if (!scriptLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(scriptLimit.resetInSec),
          },
        }
      );
    }
  }

  // 3. General API Rate Limiting (Anti-DDoS)
  if (path.startsWith("/api/")) {
    const apiLimit = checkRateLimit(`api:${ip}`, 200, 60 * 1000); // 200 req/min
    if (!apiLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "DDoS Protection Activated",
          message: "Rate limit exceeded. Try again shortly.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(apiLimit.resetInSec),
          },
        }
      );
    }
  }

  // 4. Harden Security Headers
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
