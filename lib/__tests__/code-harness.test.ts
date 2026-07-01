import { describe, it, expect } from "vitest";
import { parseTestInput, buildJavaHarnessScript, buildCppScript } from "@/lib/code-harness";

describe("code-harness", () => {
  it("parses multi-arg test input", () => {
    expect(parseTestInput("[2,7,11,15], 9")).toEqual([[2, 7, 11, 15], 9]);
  });

  it("builds java harness for two sum", () => {
    const script = buildJavaHarnessScript(
      "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0,1}; } }",
      "twoSum",
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
    );
    expect(script).toContain("public class Main");
    expect(script.indexOf("public class Main")).toBeLessThan(script.indexOf("class Solution"));
  });

  it("builds cpp harness for two sum", () => {
    const script = buildCppScript(
      "class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { return {0,1}; } };",
      "twoSum",
      { input: "[2,7,11,15], 9", expectedOutput: "[0,1]" },
    );
    expect(script).toContain("#include <bits/stdc++.h>");
    expect(script).toContain("twoSum");
  });
});
