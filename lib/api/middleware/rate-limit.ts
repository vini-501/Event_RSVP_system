import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Simple in-memory rate limiter for Next.js App Router.
 * NOTE: In a multi-instance/serverless environment, this will only 
 * limit requests per-instance. For production, use Upstash Redis.
 */
export async function rateLimit(
  request: NextRequest,
  options: {
    limit: number;
    windowMs: number;
    keyPrefix?: string;
  }
) {
  const { limit, windowMs, keyPrefix = 'rl' } = options;
  
  // Get IP from headers (standard for Vercel/proxies)
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  
  let record = memoryStore.get(key);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + windowMs,
    };
  }
  
  record.count += 1;
  memoryStore.set(key, record);
  
  const isLimited = record.count > limit;
  const remaining = Math.max(0, limit - record.count);
  
  return {
    isLimited,
    remaining,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}

/**
 * Cleanup expired entries periodically to prevent memory leaks
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key);
      }
    }
  }, 60000); // Every minute
}
