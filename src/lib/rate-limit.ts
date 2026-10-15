import { NextResponse } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const cleanupInterval = 5 * 60 * 1000;
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, cleanupInterval);
}

export interface RateLimitOptions {
  /** Maximum number of allowed requests in the window */
  limit: number;
  /** Sliding window duration in milliseconds (default: 60,000ms / 1 minute) */
  windowMs?: number;
  /** Custom prefix to segment rate limits per endpoint or action */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Extracts a client IP from common proxy headers.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || headers.get("cf-connecting-ip") || "127.0.0.1";
}

/**
 * Evaluates rate limit for a client identifier.
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { limit, windowMs = 60 * 1000, prefix = "global" } = options;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Remove timestamps older than the window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const reset = Math.ceil((windowMs - (record.timestamps[0] ? now - record.timestamps[0] : 0)) / 1000);

  if (record.timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(reset, 1),
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.max(reset, 1),
  };
}

/**
 * Helper to check rate limit in Next.js route handlers.
 * Returns null if allowed, or a 429 NextResponse if rate limit exceeded.
 */
export function enforceRateLimit(
  request: Request,
  options: RateLimitOptions,
  userId?: string
): NextResponse | null {
  const clientIp = getClientIp(request);
  const identifier = userId ? `user:${userId}` : `ip:${clientIp}`;
  const result = rateLimit(identifier, options);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please slow down and try again shortly.",
        retryAfter: result.reset,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.reset.toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return null;
}
