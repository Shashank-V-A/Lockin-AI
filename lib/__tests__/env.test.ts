import { describe, it, expect } from "vitest";
import { allowLocalCodeExecution } from "@/lib/env";

describe("allowLocalCodeExecution", () => {
  it("disables local exec when DISABLE_LOCAL_CODE_EXEC is true", () => {
    const prev = process.env.DISABLE_LOCAL_CODE_EXEC;
    process.env.DISABLE_LOCAL_CODE_EXEC = "true";
    expect(allowLocalCodeExecution()).toBe(false);
    process.env.DISABLE_LOCAL_CODE_EXEC = prev;
  });
});
