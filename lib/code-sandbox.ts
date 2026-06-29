import type { TestCase } from "@/types/coding";
import type { ExecutionResult, TestResult } from "@/lib/code-runner";

const PISTON_URL = process.env.PISTON_API_URL ?? "https://emkc.org/api/v2/piston";
const JUDGE0_URL = process.env.JUDGE0_API_URL;
const CODE_RUNNER = process.env.CODE_RUNNER ?? "auto"; // auto | piston | judge0 | local

const PISTON_LANG: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "c++",
};

const JUDGE0_LANG: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

/** Runs tests via configured sandbox (Judge0 → Piston → null for local fallback). */
export async function runSandboxTests(params: {
  code: string;
  language: string;
  fnName: string;
  testCases: TestCase[];
  start: number;
}): Promise<ExecutionResult | null> {
  if (process.env.DISABLE_PISTON === "true" && !JUDGE0_URL) return null;

  const preferJudge0 = CODE_RUNNER === "judge0" || (CODE_RUNNER === "auto" && JUDGE0_URL);
  const preferPiston = CODE_RUNNER === "piston" || (CODE_RUNNER === "auto" && !preferJudge0);

  if (preferJudge0 && JUDGE0_URL) {
    const result = await runJudge0Tests(params);
    if (result) return result;
  }

  if (preferPiston && process.env.DISABLE_PISTON !== "true") {
    return executePistonTests(params);
  }

  return null;
}

async function executePistonTests(params: {
  code: string;
  language: string;
  fnName: string;
  testCases: TestCase[];
  start: number;
}): Promise<ExecutionResult | null> {
  const pistonLang = PISTON_LANG[params.language];
  if (!pistonLang) return null;

  const testResults: TestResult[] = [];

  for (const test of params.testCases) {
    const script = buildScript(params.language, params.fnName, params.code, test);
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
        return compileErrorResult(params.testCases, data.compile?.stderr ?? "Compilation failed", params.start);
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

  return buildResult(testResults, params.testCases.length, params.start);
}

async function runJudge0Tests(params: {
  code: string;
  language: string;
  fnName: string;
  testCases: TestCase[];
  start: number;
}): Promise<ExecutionResult | null> {
  const langId = JUDGE0_LANG[params.language];
  if (!langId || !JUDGE0_URL) return null;

  const testResults: TestResult[] = [];
  const baseUrl = JUDGE0_URL.replace(/\/$/, "");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = process.env.JUDGE0_API_KEY;
  }

  for (const test of params.testCases) {
    const script = buildScript(params.language, params.fnName, params.code, test);
    try {
      const res = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: script,
          language_id: langId,
          cpu_time_limit: 5,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        status?: { id: number; description: string };
      };

      if (data.compile_output) {
        return compileErrorResult(params.testCases, data.compile_output, params.start);
      }

      const stdout = (data.stdout ?? "").trim();
      const passed = stdout === test.expectedOutput.trim();

      testResults.push({
        passed,
        input: test.input,
        expected: test.expectedOutput,
        actual: stdout || undefined,
        error: passed ? undefined : data.stderr ?? `Expected ${test.expectedOutput}, got ${stdout}`,
      });
    } catch {
      return null;
    }
  }

  return buildResult(testResults, params.testCases.length, params.start);
}

function buildScript(language: string, fnName: string, code: string, test: TestCase): string {
  if (language === "python") {
    return `${code}\nimport json\nresult = ${fnName}(${test.input})\nprint(json.dumps(result) if not isinstance(result, (int, float, bool)) else result)`;
  }
  if (language === "javascript") {
    return `${code}\nconst result = ${fnName}(${test.input});\nconsole.log(typeof result === "object" ? JSON.stringify(result) : String(result));`;
  }
  return code;
}

function buildResult(testResults: TestResult[], total: number, start: number): ExecutionResult {
  const passedTests = testResults.filter((r) => r.passed).length;
  return {
    status: passedTests === total ? "PASSED" : "FAILED",
    passedTests,
    totalTests: total,
    testResults,
    runtime: Date.now() - start,
    memory: 0,
  };
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

export const AI_REVIEW_ONLY_LANGUAGES = new Set(["java", "cpp"]);
