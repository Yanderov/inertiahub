interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  limit?: number; // Max requests
  windowMs?: number; // Window size in ms
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60 * 1000 }
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const limit = options.limit ?? 60;
  const windowMs = options.windowMs ?? 60 * 1000;

  // Cleanup expired entries occasionally
  if (Math.random() < 0.05) {
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }

  const record = store[identifier];

  if (!record || record.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
