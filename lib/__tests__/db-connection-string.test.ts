import { describe, expect, it } from "vitest";
import { normalizeDatabaseUrl } from "@/lib/db-connection-string";

describe("normalizeDatabaseUrl", () => {
  it("upgrades sslmode=require to verify-full", () => {
    expect(
      normalizeDatabaseUrl(
        "postgresql://u:p@host/db?sslmode=require&channel_binding=require",
      ),
    ).toBe(
      "postgresql://u:p@host/db?sslmode=verify-full&channel_binding=require",
    );
  });

  it("leaves verify-full unchanged", () => {
    const url = "postgresql://u:p@host/db?sslmode=verify-full";
    expect(normalizeDatabaseUrl(url)).toBe(url);
  });
});
