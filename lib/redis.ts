import { Redis } from "@upstash/redis";

/** Upstash Redis client for caching. Returns null when not configured. */
export function getRedis(): Redis | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/** Gets cached value or computes and stores it. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fn();

  const cachedValue = await redis.get<T>(key);
  if (cachedValue !== null && cachedValue !== undefined) {
    return cachedValue;
  }

  const value = await fn();
  await redis.set(key, value, { ex: ttlSeconds });
  return value;
}

/** Busts cached dashboard data for a user after mutations. */
export async function invalidateDashboardCache(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await Promise.all([
    redis.del(`dashboard:stats:${userId}`),
    redis.del(`dashboard:analytics:${userId}`),
  ]);
}
