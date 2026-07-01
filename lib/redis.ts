import { Redis } from "@upstash/redis";

const memoryCache = new Map<string, { value: unknown; expires: number }>();
const MAX_MEMORY_ENTRIES = 256;

function memoryGet<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expires <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function memorySet(key: string, value: unknown, ttlSeconds: number) {
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

function invalidateMemoryKeys(matcher: (key: string) => boolean) {
  for (const key of memoryCache.keys()) {
    if (matcher(key)) memoryCache.delete(key);
  }
}

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

/** Gets cached value or computes and stores it. Falls back to in-memory cache when Redis is unavailable. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();

  if (redis) {
    const cachedValue = await redis.get<T>(key);
    if (cachedValue !== null && cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await fn();
    await redis.set(key, value, { ex: ttlSeconds });
    return value;
  }

  const hit = memoryGet<T>(key);
  if (hit !== null) return hit;

  const value = await fn();
  memorySet(key, value, ttlSeconds);
  return value;
}

/** Busts cached dashboard and related data for a user after mutations. */
export async function invalidateDashboardCache(userId: string): Promise<void> {
  const keys = [
    `dashboard:stats:${userId}`,
    `dashboard:analytics:${userId}`,
    `coach:weak:${userId}`,
    `coding:progress:${userId}`,
  ];

  invalidateMemoryKeys((key) => keys.includes(key));

  const redis = getRedis();
  if (!redis) return;
  await Promise.all(keys.map((key) => redis.del(key)));
}
