import type { TestCase } from "@/types/coding";
import type { ExecutionResult, TestResult } from "@/lib/code-runner";
import {
  buildPythonScript,
  buildJsScript,
  buildJavaHarnessScript,
  buildCppScript,
} from "@/lib/code-harness";

const PUBLIC_PISTON_URL = "https://emkc.org/api/v2/piston";
const PISTON_URL = process.env.PISTON_API_URL ?? PUBLIC_PISTON_URL;
const JUDGE0_URL = process.env.JUDGE0_API_URL;
const CODE_RUNNER = process.env.CODE_RUNNER ?? "auto";

function pistonHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = process.env.PISTON_API_TOKEN;
  if (token) headers.Authorization = token;
  return headers;
}

async function readPistonHttpError(res: Response): Promise<string> {
  const fallback = `Piston API error (${res.status})`;
  try {
    const body = (await res.json()) as { message?: string };
    return body.message?.trim() || fallback;
  } catch {
    return fallback;
  }
}

/** Self-hosted Piston uses /api/v2/execute; the public proxy uses /api/v2/piston/execute. */
function pistonExecuteUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  try {
    const { hostname } = new URL(base);
    if (hostname !== "emkc.org" && base.endsWith("/piston")) {
      return `${base.slice(0, -"/piston".length)}/execute`;
    }
  } catch {
    /* ignore malformed URLs */
  }
  return `${base}/execute`;
}

function pistonRuntimesUrl(baseUrl: string): string {
  const execute = pistonExecuteUrl(baseUrl);
  return execute.replace(/\/execute$/, "/runtimes");
}

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

const SANDBOX_LANGUAGES = new Set(["python", "javascript", "java", "cpp"]);

/** Runs tests via configured sandbox (Judge0 → Piston → null for local fallback). */
export async function runSandboxTests(params: {
  code: string;
  language: string;
  fnName: string;
  testCases: TestCase[];
  start: number;
}): Promise<ExecutionResult | null> {
  if (!SANDBOX_LANGUAGES.has(params.language)) return null;
  if (process.env.DISABLE_PISTON === "true" && !JUDGE0_URL) return null;

  const preferJudge0 = CODE_RUNNER === "judge0" || (CODE_RUNNER === "auto" && JUDGE0_URL);
  const preferPiston = CODE_RUNNER === "piston" || (CODE_RUNNER === "auto" && !preferJudge0);

  if (preferJudge0 && JUDGE0_URL) {
    const result = await runJudge0Tests(params);
    if (result) return result;
  }

  if (preferPiston && process.env.DISABLE_PISTON !== "true") {
    const result = await executePistonTests(params);
    if (result) return result;

    if (JUDGE0_URL) {
      const judgeResult = await runJudge0Tests(params);
      if (judgeResult) return judgeResult;
    }

    return await pistonUnavailableResult(params, params.start);
  }

  return null;
}

function buildPistonFiles(language: string, content: string): { name?: string; content: string }[] {
  if (language === "java") {
    return [{ name: "Main.java", content }];
  }
  if (language === "cpp") {
    return [{ name: "main.cpp", content }];
  }
  return [{ content }];
}

function pistonStageError(
  stage: { stderr?: string; code?: number; message?: string | null } | undefined,
  fallback: string,
): string {
  const stderr = stage?.stderr?.trim();
  if (stderr) return stderr.slice(0, 500);
  if (stage?.message) return stage.message.slice(0, 500);
  return fallback;
}

function isPistonCompileFailure(compile: { code?: number } | undefined): boolean {
  return compile != null && compile.code != null && compile.code !== 0;
}

export { isPistonCompileFailure };

async function executePistonTests(
  params: {
    code: string;
    language: string;
    fnName: string;
    testCases: TestCase[];
    start: number;
  },
  baseUrl: string = PISTON_URL,
): Promise<ExecutionResult | null> {
  const pistonLang = PISTON_LANG[params.language];
  if (!pistonLang) return null;

  const testResults: TestResult[] = [];

  for (const test of params.testCases) {
    const script = buildScript(params.language, params.fnName, params.code, test);
    try {
      const res = await fetch(pistonExecuteUrl(baseUrl), {
        method: "POST",
        headers: pistonHeaders(),
        body: JSON.stringify({
          language: pistonLang,
          version: "*",
          files: buildPistonFiles(params.language, script),
          run_timeout: 8000,
          compile_timeout: 10000,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!res.ok) {
        if (JUDGE0_URL) return null;
        return compileErrorResult(params.testCases, await readPistonHttpError(res), params.start);
      }

      const data = (await res.json()) as {
        run?: { stdout?: string; stderr?: string; code?: number; message?: string | null };
        compile?: { stderr?: string; code?: number; message?: string | null };
      };

      if (isPistonCompileFailure(data.compile)) {
        return compileErrorResult(
          params.testCases,
          pistonStageError(data.compile, "Compilation failed"),
          params.start,
        );
      }

      if (data.run?.code != null && data.run.code !== 0) {
        return compileErrorResult(
          params.testCases,
          pistonStageError(data.run, "Execution failed"),
          params.start,
        );
      }

      const stdout = (data.run?.stdout ?? "").trim();
      const stderr = data.run?.stderr ?? "";
      const passed = stdout === test.expectedOutput.trim();

      testResults.push({
        passed,
        input: test.input,
        expected: test.expectedOutput,
        actual: stdout || undefined,
        error: passed ? undefined : stderr || `Expected ${test.expectedOutput}, got ${stdout || "(empty)"}`,
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
          cpu_time_limit: 8,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!res.ok) return null;

      const data = (await res.json()) as {
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
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
        error: passed ? undefined : data.stderr ?? `Expected ${test.expectedOutput}, got ${stdout || "(empty)"}`,
      });
    } catch {
      return null;
    }
  }

  return buildResult(testResults, params.testCases.length, params.start);
}

function buildScript(language: string, fnName: string, code: string, test: TestCase): string {
  switch (language) {
    case "python":
      return buildPythonScript(code, fnName, test);
    case "javascript":
      return buildJsScript(code, fnName, test);
    case "java":
      return buildJavaHarnessScript(code, fnName, test);
    case "cpp":
      return buildCppScript(code, fnName, test);
    default:
      return code;
  }
}

function buildResult(testResults: TestResult[], total: number, start: number): ExecutionResult {
  const passedTests = testResults.filter((r) => r.passed).length;
  const allErrored = passedTests === 0 && testResults.every((r) => r.error && !r.actual);

  return {
    status: passedTests === total ? "PASSED" : allErrored ? "ERROR" : "FAILED",
    passedTests,
    totalTests: total,
    testResults,
    runtime: Date.now() - start,
    memory: 0,
  };
}

async function pistonUnavailableResult(
  params: { language: string; testCases: TestCase[]; start: number },
  start: number,
): Promise<ExecutionResult> {
  let msg = JUDGE0_URL
    ? "Code execution failed. Piston and Judge0 are both unavailable — try again shortly."
    : "Code sandbox unavailable. Set JUDGE0_API_URL or run Piston locally: docker compose up piston -d";

  try {
    const res = await fetch(pistonRuntimesUrl(PISTON_URL), {
      headers: pistonHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const runtimes = (await res.json()) as { language: string }[];
      if (runtimes.length === 0) {
        msg =
          "Piston is running but no language runtimes are installed. Run: npm run piston:setup";
      } else if (!runtimes.some((r) => r.language === PISTON_LANG[params.language])) {
        msg = `Piston is missing the ${params.language} runtime. Run: npm run piston:setup`;
      } else if (!JUDGE0_URL) {
        msg =
          "Public Piston execute API is restricted. Set JUDGE0_API_URL (e.g. https://ce.judge0.com) or self-host Piston.";
      }
    } else if (!JUDGE0_URL) {
      msg = await readPistonHttpError(res);
    }
  } catch {
    if (!JUDGE0_URL) {
      msg =
        "Cannot reach the code sandbox. For production, set JUDGE0_API_URL=https://ce.judge0.com";
    }
  }

  return compileErrorResult(params.testCases, msg, start);
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
