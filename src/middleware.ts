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
