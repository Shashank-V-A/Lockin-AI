import type { TestCase } from "@/types/coding";

/** Parses test input strings into argument values (LeetCode-style). */
export function parseTestInput(input: string): unknown[] {
  const trimmed = input.trim();
  if (!trimmed.includes(",")) {
    return [parseSingleValue(trimmed)];
  }

  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "[" || ch === "{" || ch === "(") depth++;
    if (ch === "]" || ch === "}" || ch === ")") depth--;

    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());

  return parts.map(parseSingleValue);
}

function parseSingleValue(raw: string): unknown {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("[")) return JSON.parse(value);
  if (value.startsWith("{")) return JSON.parse(value);
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d+\.\d+$/.test(value)) return Number(value);
  return value;
}

function javaLiteral(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (Array.isArray(value)) {
    if (value.length === 0) return "new int[]{}";
    if (value.every((v) => typeof v === "number")) {
      return `new int[]{${value.join(",")}}`;
    }
    if (value.every((v) => typeof v === "string")) {
      return `new String[]{${value.map((s) => javaLiteral(s)).join(", ")}}`;
    }
    throw new Error("Unsupported array element type for Java harness");
  }
  throw new Error("Unsupported Java argument type");
}

function cppArg(value: unknown, index: number): { decl: string; ref: string } {
  if (typeof value === "number") {
    const name = `arg${index}`;
    return { decl: `int ${name} = ${value};`, ref: name };
  }
  if (typeof value === "boolean") {
    const name = `arg${index}`;
    return { decl: `bool ${name} = ${value};`, ref: name };
  }
  if (typeof value === "string") {
    const name = `arg${index}`;
    const lit = `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    return { decl: `string ${name} = ${lit};`, ref: name };
  }
  if (Array.isArray(value) && value.every((v) => typeof v === "number")) {
    const name = `arg${index}`;
    return { decl: `vector<int> ${name} = {${value.join(",")}};`, ref: name };
  }
  throw new Error("Unsupported C++ argument type");
}

function normalizeJavaUserCode(code: string): string {
  return code.replace(/\bpublic\s+class\s+Solution\b/g, "class Solution");
}

function normalizeCppUserCode(code: string): string {
  return code
    .replace(/\busing\s+namespace\s+std\s*;/g, "")
    .replace(/#include\s+<[^>]+>\s*/g, "");
}

export function buildPythonScript(userCode: string, fnName: string, test: TestCase): string {
  return `${userCode}
import json
result = ${fnName}(${test.input})
if isinstance(result, bool):
    print("True" if result else "False")
elif isinstance(result, (int, float)):
    print(result)
else:
    print(json.dumps(result))`;
}

export function buildJsScript(userCode: string, fnName: string, test: TestCase): string {
  return `${userCode}
const result = ${fnName}(${test.input});
if (typeof result === "boolean") {
  console.log(result ? "True" : "False");
} else if (typeof result === "object" && result !== null) {
  console.log(JSON.stringify(result));
} else {
  console.log(String(result));
}`;
}

export function buildJavaHarnessScript(userCode: string, fnName: string, test: TestCase): string {
  const args = parseTestInput(test.input);
  const solution = normalizeJavaUserCode(userCode);
  const argLiterals = args.map(javaLiteral).join(", ");

  return `import java.util.*;

public class Main {
  static String formatResult(Object result) {
    if (result instanceof int[]) {
      int[] arr = (int[]) result;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < arr.length; i++) {
        if (i > 0) sb.append(",");
        sb.append(arr[i]);
      }
      sb.append("]");
      return sb.toString();
    }
    if (result instanceof Boolean) {
      return (Boolean) result ? "True" : "False";
    }
    if (result instanceof Integer || result instanceof Long || result instanceof Double) {
      return String.valueOf(result);
    }
    if (result instanceof String) {
      return (String) result;
    }
    return String.valueOf(result);
  }

  public static void main(String[] args) {
    Solution s = new Solution();
    Object result = s.${fnName}(${argLiterals});
    System.out.print(formatResult(result));
  }
}

${solution}`;
}

function cppPrintStatement(expected: string): string {
  if (expected.startsWith("[")) {
    return `cout << "[" << result[0];
    for (size_t i = 1; i < result.size(); i++) cout << "," << result[i];
    cout << "]";`;
  }
  if (expected === "True" || expected === "False") {
    return `cout << (result ? "True" : "False");`;
  }
  if (expected === "true" || expected === "false") {
    return `cout << (result ? "true" : "false");`;
  }
  if (expected.startsWith('"')) {
    return `cout << result;`;
  }
  return `cout << result;`;
}

export function buildCppScript(userCode: string, fnName: string, test: TestCase): string {
  const args = parseTestInput(test.input);
  const solution = normalizeCppUserCode(userCode);
  const decls = args.map((a, i) => cppArg(a, i));
  const callArgs = decls.map((d) => d.ref).join(", ");
  const printStmt = cppPrintStatement(test.expectedOutput.trim());

  return `#include <bits/stdc++.h>
using namespace std;

${solution}

int main() {
  Solution s;
  ${decls.map((d) => d.decl).join("\n  ")}
  auto result = s.${fnName}(${callArgs});
  ${printStmt}
  return 0;
}`;
}
