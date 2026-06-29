import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => ({
  getRedis: () => null,
}));

vi.mock("@/lib/env", () => ({
  isProduction: () => false,
}));

describe("enforceRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows requests within limit using memory fallback", async () => {
    const { enforceRateLimit } = await import("@/lib/rate-limit");
    await expect(enforceRateLimit("user-1", "coach")).resolves.toBeUndefined();
    await expect(enforceRateLimit("user-1", "coach")).resolves.toBeUndefined();
  });

  it("throws RateLimitError when exceeded", async () => {
    vi.doMock("@/lib/redis", () => ({ getRedis: () => null }));
    const { enforceRateLimit, RateLimitError } = await import("@/lib/rate-limit");

    for (let i = 0; i < 40; i++) {
      await enforceRateLimit("user-2", "coach");
    }
    await expect(enforceRateLimit("user-2", "coach")).rejects.toBeInstanceOf(RateLimitError);
  });
});

describe("enforceRateLimit production", () => {
  it("fails closed without Redis in production", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isProduction: () => true }));
    vi.doMock("@/lib/redis", () => ({ getRedis: () => null }));

    const { enforceRateLimit } = await import("@/lib/rate-limit");
    await expect(enforceRateLimit("user-3", "coach")).rejects.toThrow(/Rate limiting unavailable/);
  });
});
