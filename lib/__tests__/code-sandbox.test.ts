import { describe, expect, it } from "vitest";
import { isPistonCompileFailure } from "@/lib/code-sandbox";

describe("isPistonCompileFailure", () => {
  it("ignores missing compile stage (python/javascript)", () => {
    expect(isPistonCompileFailure(undefined)).toBe(false);
  });

  it("treats successful compile as ok", () => {
    expect(isPistonCompileFailure({ code: 0 })).toBe(false);
  });

  it("detects failed compile", () => {
    expect(isPistonCompileFailure({ code: 1 })).toBe(true);
  });
});
