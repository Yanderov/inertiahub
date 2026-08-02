// Sliding-window in-memory rate limiter for edge & API protection

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}, 30000);

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const reset = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      reset,
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}
