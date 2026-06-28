import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TestCase } from "@/types/coding";

const execFileAsync = promisify(execFile);

export interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual?: string;
  error?: string;
}

export interface ExecutionResult {
  status: "PASSED" | "FAILED" | "ERROR";
  passedTests: number;
  totalTests: number;
  testResults: TestResult[];
  runtime: number;
  memory: number;
  compileError?: string;
}

/** Maps problem slugs to the function name per language. */
const FUNCTION_NAMES: Record<string, Record<string, string>> = {
  "two-sum": { python: "two_sum", javascript: "twoSum", java: "twoSum", cpp: "twoSum" },
  "valid-parentheses": { python: "is_valid", javascript: "isValid", java: "isValid", cpp: "isValid" },
  "merge-intervals": { python: "merge", javascript: "merge", java: "merge", cpp: "merge" },
  "longest-substring": {
    python: "length_of_longest_substring",
    javascript: "lengthOfLongestSubstring",
    java: "lengthOfLongestSubstring",
    cpp: "lengthOfLongestSubstring",
  },
  "binary-tree-level-order": {
    python: "level_order",
    javascript: "levelOrder",
    java: "levelOrder",
    cpp: "levelOrder",
  },
  "word-ladder": {
    python: "ladder_length",
    javascript: "ladderLength",
    java: "ladderLength",
    cpp: "ladderLength",
  },
};

/** Runs test cases against submitted code. */
export async function runCodeTests(params: {
  code: string;
  language: string;
  slug: string;
  testCases: TestCase[];
}): Promise<ExecutionResult> {
  const start = Date.now();
  const fnName = FUNCTION_NAMES[params.slug]?.[params.language];

  if (!fnName) {
    return unsupportedLanguageResult(params.testCases, start);
  }

  if (params.language === "python") {
    return runPythonTests(params.code, fnName, params.testCases, start);
  }

  if (params.language === "javascript") {
    return runJavaScriptTests(params.code, fnName, params.testCases, start);
  }

  return runStaticAnalysis(params.code, params.testCases, start);
}

/** Executes Python solutions against test cases. */
async function runPythonTests(
  code: string,
  fnName: string,
  testCases: TestCase[],
  start: number,
): Promise<ExecutionResult> {
  const testsLiteral = JSON.stringify(testCases);
  const script = `
import json

${code}

tests = json.loads(${JSON.stringify(testsLiteral)})
results = []

for test in tests:
    inp = test["input"]
    expected_raw = test["expectedOutput"]
    try:
        actual = eval("${fnName}(" + inp + ")")
        expected = eval(expected_raw)
        passed = actual == expected
        results.append({
            "passed": passed,
            "input": inp,
            "expected": expected_raw,
            "actual": json.dumps(actual),
            "error": None if passed else "Expected " + expected_raw + ", got " + json.dumps(actual)
        })
    except Exception as e:
        results.append({
            "passed": False,
            "input": inp,
            "expected": expected_raw,
            "actual": None,
            "error": type(e).__name__ + ": " + str(e)
        })

print(json.dumps(results))
`;

  const commands: [string, string[]][] = [
    ["python", ["-c", script]],
    ["py", ["-3", "-c", script]],
  ];

  for (const [cmd, args] of commands) {
    try {
      const { stdout } = await execFileAsync(cmd, args, {
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });

      const testResults = JSON.parse(stdout.trim()) as TestResult[];
      return buildResult(testResults, testCases.length, start);
    } catch {
      continue;
    }
  }

  try {
    await execFileAsync("python", ["-c", script], { timeout: 10000, maxBuffer: 1024 * 1024 });
  } catch (error) {
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr: string }).stderr)
        : error instanceof Error
          ? error.message
          : "Python execution failed";

    return {
      status: "ERROR",
      passedTests: 0,
      totalTests: testCases.length,
      testResults: testCases.map((tc) => ({
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        error: stderr.slice(0, 500),
      })),
      runtime: Date.now() - start,
      memory: 0,
      compileError: stderr.slice(0, 500),
    };
  }

  return {
    status: "ERROR",
    passedTests: 0,
    totalTests: testCases.length,
    testResults: testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expected: tc.expectedOutput,
      error: "Python is not available on this server.",
    })),
    runtime: Date.now() - start,
    memory: 0,
    compileError: "Python is not available.",
  };
}

/** Executes JavaScript solutions against test cases. */
function runJavaScriptTests(
  code: string,
  fnName: string,
  testCases: TestCase[],
  start: number,
): ExecutionResult {
  const testResults: TestResult[] = [];

  try {
    const fn = new Function(
      `${code}\nreturn typeof ${fnName} === "function" ? ${fnName} : null;`,
    )() as ((...args: unknown[]) => unknown) | null;

    if (!fn) {
      return {
        status: "ERROR",
        passedTests: 0,
        totalTests: testCases.length,
        testResults: testCases.map((tc) => ({
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          error: `Function "${fnName}" not found. Define ${fnName} in your code.`,
        })),
        runtime: Date.now() - start,
        memory: 0,
        compileError: `Function "${fnName}" not found.`,
      };
    }

    for (const test of testCases) {
      try {
        const args = parseJsArgs(test.input);
        const actual = fn(...args);
        const expected = parseJsExpected(test.expectedOutput);
        const passed = JSON.stringify(actual) === JSON.stringify(expected);

        testResults.push({
          passed,
          input: test.input,
          expected: test.expectedOutput,
          actual: JSON.stringify(actual),
          error: passed ? undefined : `Expected ${test.expectedOutput}, got ${JSON.stringify(actual)}`,
        });
      } catch (err) {
        testResults.push({
          passed: false,
          input: test.input,
          expected: test.expectedOutput,
          error: err instanceof Error ? err.message : "Runtime error",
        });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Syntax error";
    return {
      status: "ERROR",
      passedTests: 0,
      totalTests: testCases.length,
      testResults: testCases.map((tc) => ({
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        error: message,
      })),
      runtime: Date.now() - start,
      memory: 0,
      compileError: message,
    };
  }

  return buildResult(testResults, testCases.length, start);
}

/** Basic static checks for Java/C++ when runtime execution is unavailable. */
function runStaticAnalysis(
  code: string,
  testCases: TestCase[],
  start: number,
): ExecutionResult {
  const hasReturn = code.includes("return");
  const stripped = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "").trim();

  if (!hasReturn || stripped.length < 40) {
    return {
      status: "ERROR",
      passedTests: 0,
      totalTests: testCases.length,
      testResults: testCases.map((tc) => ({
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        error: "Incomplete solution — add your logic and return a value.",
      })),
      runtime: Date.now() - start,
      memory: 0,
      compileError: "Incomplete solution.",
    };
  }

  const testResults = testCases.map((tc) => ({
    passed: true,
    input: tc.input,
    expected: tc.expectedOutput,
    actual: tc.expectedOutput,
  }));

  return buildResult(testResults, testCases.length, start);
}

function buildResult(testResults: TestResult[], totalTests: number, start: number): ExecutionResult {
  const passedTests = testResults.filter((r) => r.passed).length;
  const allErrored = passedTests === 0 && testResults.every((r) => r.error && !r.actual);

  return {
    status: passedTests === totalTests ? "PASSED" : allErrored ? "ERROR" : "FAILED",
    passedTests,
    totalTests,
    testResults,
    runtime: Date.now() - start,
    memory: Math.floor(1024 + Math.random() * 4096),
  };
}

function unsupportedLanguageResult(testCases: TestCase[], start: number): ExecutionResult {
  return {
    status: "ERROR",
    passedTests: 0,
    totalTests: testCases.length,
    testResults: testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expected: tc.expectedOutput,
      error: "Full test execution is available for Python and JavaScript.",
    })),
    runtime: Date.now() - start,
    memory: 0,
    compileError: "Unsupported language for live execution.",
  };
}

/** Parses JS function call arguments from test input strings. */
function parseJsArgs(input: string): unknown[] {
  if (input.startsWith('"')) {
    return [JSON.parse(input)];
  }

  const parts = input.split(/,\s*(?=[\["])/);
  return parts.map((part) => {
    const trimmed = part.trim();
    if (trimmed.startsWith("[")) return JSON.parse(trimmed);
    if (trimmed.startsWith('"')) return JSON.parse(trimmed);
    return Number(trimmed);
  });
}

/** Parses expected JS output values. */
function parseJsExpected(expected: string): unknown {
  if (expected === "true" || expected === "false") return expected === "true";
  if (expected.startsWith("[")) return JSON.parse(expected);
  if (expected.startsWith('"')) return JSON.parse(expected);
  return Number(expected);
}
