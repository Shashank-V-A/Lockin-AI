import { getRedis } from "@/lib/redis";

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

export class RateLimitError extends Error {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

/** Enforces per-user rate limits via Upstash Redis (no-op when Redis unset). */
export async function enforceRateLimit(
  userId: string,
  action: RateLimitAction,
): Promise<void> {
  const redis = getRedis();
  const { max, windowSec } = LIMITS[action];
  if (!redis) return;

  const key = `rl:${action}:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSec);
  }
  if (count > max) {
    throw new RateLimitError();
  }
}
