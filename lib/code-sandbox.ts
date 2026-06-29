import type { TestCase } from "@/types/coding";
import type { ExecutionResult, TestResult } from "@/lib/code-runner";

const PISTON_URL = process.env.PISTON_API_URL ?? "https://emkc.org/api/v2/piston";

const PISTON_LANG: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "c++",
};

/** Runs code in Piston sandbox when available (production-safe). */
export async function runPistonTests(params: {
  code: string;
  language: string;
  fnName: string;
  testCases: TestCase[];
  start: number;
}): Promise<ExecutionResult | null> {
  const pistonLang = PISTON_LANG[params.language];
  if (!pistonLang || process.env.DISABLE_PISTON === "true") return null;

  const testResults: TestResult[] = [];

  for (const test of params.testCases) {
    const script = buildPistonScript(params.language, params.fnName, params.code, test);
    try {
      const res = await fetch(`${PISTON_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: pistonLang,
          version: "*",
          files: [{ content: script }],
          run_timeout: 5000,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        run?: { stdout?: string; stderr?: string; code?: number };
        compile?: { stderr?: string; code?: number };
      };

      if (data.compile?.code !== 0) {
        const err = data.compile?.stderr ?? "Compilation failed";
        return compileErrorResult(params.testCases, err, params.start);
      }

      const stdout = (data.run?.stdout ?? "").trim();
      const stderr = data.run?.stderr ?? "";
      const passed = stdout === test.expectedOutput.trim();

      testResults.push({
        passed,
        input: test.input,
        expected: test.expectedOutput,
        actual: stdout || undefined,
        error: passed ? undefined : stderr || `Expected ${test.expectedOutput}, got ${stdout}`,
      });
    } catch {
      return null;
    }
  }

  const passedTests = testResults.filter((r) => r.passed).length;
  return {
    status: passedTests === params.testCases.length ? "PASSED" : "FAILED",
    passedTests,
    totalTests: params.testCases.length,
    testResults,
    runtime: Date.now() - params.start,
    memory: 0,
  };
}

function buildPistonScript(
  language: string,
  fnName: string,
  code: string,
  test: TestCase,
): string {
  if (language === "python") {
    return `${code}\nimport json\nresult = ${fnName}(${test.input})\nprint(json.dumps(result) if not isinstance(result, (int, float, bool)) else result)`;
  }
  if (language === "javascript") {
    return `${code}\nconst result = ${fnName}(${test.input});\nconsole.log(typeof result === "object" ? JSON.stringify(result) : String(result));`;
  }
  return code;
}

function compileErrorResult(testCases: TestCase[], error: string, start: number): ExecutionResult {
  return {
    status: "ERROR",
    passedTests: 0,
    totalTests: testCases.length,
    testResults: testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expected: tc.expectedOutput,
      error: error.slice(0, 500),
    })),
    runtime: Date.now() - start,
    memory: 0,
    compileError: error.slice(0, 500),
  };
}

/** Languages that only receive AI review (no live test execution). */
export const AI_REVIEW_ONLY_LANGUAGES = new Set(["java", "cpp"]);
