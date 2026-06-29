import { getRedis } from "@/lib/redis";
import { isProduction } from "@/lib/env";
import { logger } from "@/lib/logger";

export type RateLimitAction =
  | "coach"
  | "resume"
  | "interview"
  | "coding"
  | "coding-run";

const LIMITS: Record<RateLimitAction, { max: number; windowSec: number }> = {
  coach: { max: 40, windowSec: 3600 },
  resume: { max: 10, windowSec: 3600 },
  interview: { max: 15, windowSec: 3600 },
  coding: { max: 60, windowSec: 3600 },
  "coding-run": { max: 120, windowSec: 3600 },
};

/** In-memory fallback when Redis is unavailable (single-instance dev). */
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

export class RateLimitError extends Error {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

function enforceMemoryLimit(key: string, max: number, windowSec: number): void {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return;
  }

  bucket.count += 1;
  if (bucket.count > max) {
    throw new RateLimitError();
  }
}

/** Enforces per-user rate limits via Redis, with in-memory fallback. */
export async function enforceRateLimit(
  userId: string,
  action: RateLimitAction,
): Promise<void> {
  const { max, windowSec } = LIMITS[action];
  const key = `rl:${action}:${userId}`;
  const redis = getRedis();

  if (!redis) {
    if (isProduction() && process.env.ALLOW_MEMORY_RATE_LIMIT !== "true") {
      logger.error("rate_limit.redis_required", { action, userId });
      throw new Error("Rate limiting unavailable — configure Upstash Redis");
    }
    logger.warn("rate_limit.memory_fallback", { action });
    enforceMemoryLimit(key, max, windowSec);
    return;
  }

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }
  if (count > max) {
    throw new RateLimitError();
  }
}
