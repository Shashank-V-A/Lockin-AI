"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { submitCode, runCode } from "@/actions/coding-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CODING_LANGUAGES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Play, Send, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { CodingFeedback } from "@/types/coding";
import type { TestResult } from "@/lib/code-runner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[320px] w-full rounded-lg" />,
});

interface ResultState {
  runtime: number;
  memory: number;
  passedTests: number;
  totalTests: number;
  score: number;
  status: string;
  feedback: CodingFeedback;
  testResults: TestResult[];
  compileError?: string;
}

interface CodingProblemClientProps {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    topic: string;
    starterCode: unknown;
    timeLimit: number;
  };
}

/** Coding assessment editor with timer and submission. */
export function CodingProblemClient({ problem }: CodingProblemClientProps) {
  const router = useRouter();
  const starterCode = problem.starterCode as Record<string, string>;
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(starterCode.python ?? "");
  const [timeLeft, setTimeLeft] = useState(problem.timeLimit * 60);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(starterCode[lang] ?? "");
    setResult(null);
  };

  const applyRunResult = useCallback((runResult: Awaited<ReturnType<typeof runCode>>, isSubmit = false) => {
    setResult({
      runtime: runResult.runtime,
      memory: runResult.memory,
      passedTests: runResult.passedTests,
      totalTests: runResult.totalTests,
      score: Math.round((runResult.passedTests / runResult.totalTests) * 100),
      status: runResult.status,
      feedback: isSubmit && "feedback" in runResult
        ? (runResult as { feedback: CodingFeedback }).feedback
        : {
            betterSolution: "",
            timeComplexity: "",
            spaceComplexity: "",
            mistakes: [],
            summary: "",
          },
      testResults: runResult.testResults,
      compileError: runResult.compileError,
    });
  }, []);

  const handleRun = async () => {
    setRunning(true);
    try {
      const runResult = await runCode({
        problemId: problem.id,
        language,
        code,
      });
      applyRunResult(runResult);
      if (runResult.status === "PASSED") {
        toast.success("All tests passed!");
      } else if (runResult.status === "ERROR") {
        toast.error(runResult.compileError ?? "Code error — see details below");
      } else {
        toast.warning(`${runResult.passedTests}/${runResult.totalTests} tests passed`);
      }
    } catch {
      toast.error("Failed to run code");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitCode({
        problemId: problem.id,
        language,
        code,
      });
      setResult({
        runtime: res.submission.runtime ?? 0,
        memory: res.submission.memory ?? 0,
        passedTests: res.submission.passedTests ?? 0,
        totalTests: res.submission.totalTests ?? 0,
        score: res.submission.score ?? 0,
        status: res.submission.status,
        feedback: res.feedback,
        testResults: res.testResults,
        compileError: res.compileError,
      });
      if (res.submission.status === "PASSED") {
        toast.success("All tests passed!");
      } else if (res.submission.status === "ERROR") {
        toast.error(res.compileError ?? "Code error — see details below");
      } else {
        toast.warning("Some tests failed — see details below");
      }
      router.refresh();
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{problem.difficulty.toLowerCase()}</Badge>
            <Badge variant="secondary">{problem.topic}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 text-sm tabular-nums text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Problem</h2>
          </div>
          <div className="p-5">
            <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {problem.description}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CODING_LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRun} disabled={running || submitting}>
                {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Run
              </Button>
              <Button variant="accent" size="sm" onClick={handleSubmit} disabled={submitting || running}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit
              </Button>
            </div>
          </div>

          {(language === "java" || language === "cpp") && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
              Java and C++ use AI code review on submit. Use Python or JavaScript to run tests live.
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-border shadow-soft">
            <MonacoEditor
              height="400px"
              language={CODING_LANGUAGES.find((l) => l.id === language)?.monaco ?? "python"}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 12 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="surface-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Results — {result.score}% ({result.passedTests}/{result.totalTests} tests)
            </h2>
            <StatusBadge status={result.status} />
          </div>
          <div className="space-y-4 p-5">
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>Runtime: {result.runtime}ms</span>
              <span>Memory: {result.memory}KB</span>
            </div>

            {result.compileError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
                    <pre className="mt-1 whitespace-pre-wrap text-xs text-red-600 dark:text-red-300">
                      {result.compileError}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium">Test Cases</p>
              <div className="space-y-2">
                {result.testResults.map((test, i) => (
                  <TestCaseRow key={i} index={i + 1} test={test} />
                ))}
              </div>
            </div>

            {result.feedback.betterSolution && (
              <div className="grid gap-4 md:grid-cols-2 border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium">AI Feedback</p>
                  <p className="mt-1 text-sm text-muted-foreground">{result.feedback.betterSolution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Complexity</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Time: {result.feedback.timeComplexity} · Space: {result.feedback.spaceComplexity}
                  </p>
                </div>
                {result.feedback.mistakes.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">Suggestions</p>
                    <ul className="mt-1 space-y-1">
                      {result.feedback.mistakes.map((m, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    PASSED: { label: "Passed", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    FAILED: { label: "Failed", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
    ERROR: { label: "Error", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  }[status] ?? { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

function TestCaseRow({ index, test }: { index: number; test: TestResult }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-sm",
        test.passed ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
      )}
    >
      <div className="flex items-center gap-2">
        {test.passed ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="font-medium">Test {index}</span>
        <span className="text-muted-foreground">Input: {test.input}</span>
      </div>
      {!test.passed && (
        <div className="mt-2 space-y-1 pl-6 text-xs text-muted-foreground">
          <p>Expected: {test.expected}</p>
          {test.actual && <p>Got: {test.actual}</p>}
          {test.error && <p className="text-red-600 dark:text-red-400">{test.error}</p>}
        </div>
      )}
    </div>
  );
}
