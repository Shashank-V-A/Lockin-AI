"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { submitCode } from "@/actions/coding-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CODING_LANGUAGES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Play, Send, Clock } from "lucide-react";
import type { CodingFeedback } from "@/types/coding";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
  const [result, setResult] = useState<{
    runtime: number;
    memory: number;
    passedTests: number;
    totalTests: number;
    score: number;
    status: string;
    feedback: CodingFeedback;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(starterCode[lang] ?? "");
  };

  const handleRun = useCallback(async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Code executed (simulated)");
    setRunning(false);
  }, []);

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
      });
      toast.success("Submission evaluated");
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{problem.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{problem.difficulty}</Badge>
            <Badge variant="secondary">{problem.topic}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Problem</CardTitle></CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap">
              {problem.description}
            </div>
          </CardContent>
        </Card>

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
              <Button variant="outline" size="sm" onClick={handleRun} disabled={running}>
                {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Run
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Results — {result.score}% ({result.passedTests}/{result.totalTests} tests)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6 text-sm">
              <span>Runtime: {result.runtime}ms</span>
              <span>Memory: {result.memory}KB</span>
              <span>Status: {result.status}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Better Solution</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.feedback.betterSolution}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Complexity</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Time: {result.feedback.timeComplexity} · Space: {result.feedback.spaceComplexity}
                </p>
              </div>
            </div>
            {result.feedback.mistakes.length > 0 && (
              <div>
                <p className="text-sm font-medium">Mistakes</p>
                <ul className="mt-1 space-y-1">
                  {result.feedback.mistakes.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
