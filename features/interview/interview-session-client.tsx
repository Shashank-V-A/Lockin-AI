"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, finishInterview, skipQuestion, abandonInterview } from "@/actions/interview-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Clock, Loader2, SkipForward } from "lucide-react";
import type { InterviewReport } from "@/types/interview";

const SESSION_MINUTES = 45;

interface InterviewSessionClientProps {
  session: {
    id: string;
    company: string;
    role: string;
    status: string;
    overallScore: number | null;
    report: unknown;
    questions: { id: string; order: number; question: string; category: string }[];
    answers: {
      questionId: string;
      overallScore: number | null;
      feedback: string | null;
      technicalAccuracy: number | null;
      communication: number | null;
      confidence: number | null;
      completeness: number | null;
    }[];
  };
}

/** Active mock interview session UI. */
export function InterviewSessionClient({ session }: InterviewSessionClientProps) {
  const router = useRouter();
  const answeredIds = new Set(session.answers.map((a) => a.questionId));
  const currentIndex = session.questions.findIndex((q) => !answeredIds.has(q.id));
  const currentQuestion = currentIndex >= 0 ? session.questions[currentIndex] : null;
  const isComplete = session.status === "COMPLETED" || currentIndex === -1;

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_MINUTES * 60);
  const [lastEval, setLastEval] = useState<{
    overallScore: number;
    feedback: string;
    technicalAccuracy: number;
    communication: number;
    confidence: number;
    completeness: number;
  } | null>(null);

  const progress = (session.answers.length / session.questions.length) * 100;

  const handleFinish = useCallback(async () => {
    await finishInterview(session.id);
    toast.success("Interview complete!");
    router.refresh();
  }, [session.id, router]);

  useEffect(() => {
    if (isComplete || session.status !== "IN_PROGRESS") return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          handleFinish().catch(() => toast.error("Failed to finish interview"));
          return 0;
        }
        if (s === 300) toast.info("5 minutes remaining");
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete, session.status, handleFinish]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim()) return;

    setLoading(true);
    try {
      const result = await submitAnswer({
        sessionId: session.id,
        questionId: currentQuestion.id,
        answer,
        company: session.company,
        role: session.role,
        question: currentQuestion.question,
      });

      setLastEval({
        overallScore: result.overallScore ?? 0,
        feedback: result.feedback ?? "",
        technicalAccuracy: result.technicalAccuracy ?? 0,
        communication: result.communication ?? 0,
        confidence: result.confidence ?? 0,
        completeness: result.completeness ?? 0,
      });
      setAnswer("");

      if (currentIndex === session.questions.length - 1) {
        await handleFinish();
      } else {
        toast.success("Answer evaluated");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;
    setLoading(true);
    try {
      await skipQuestion({ sessionId: session.id, questionId: currentQuestion.id });
      setAnswer("");
      if (currentIndex === session.questions.length - 1) {
        await handleFinish();
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to skip question");
    } finally {
      setLoading(false);
    }
  };

  const handleAbandon = async () => {
    try {
      await abandonInterview(session.id);
      toast.info("Interview abandoned");
      router.push("/mock-interview");
    } catch {
      toast.error("Failed to abandon interview");
    }
  };

  if (isComplete) {
    const report = session.report as InterviewReport | null;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Interview Complete</h1>
            <p className="text-sm text-muted-foreground">
              {session.company} — {session.role}
            </p>
          </div>
          {session.overallScore !== null && (
            <Badge variant="accent" className="px-3 py-1 text-base tabular-nums">
              {session.overallScore}%
            </Badge>
          )}
        </div>

        {report && (
          <>
            <div className="surface-card p-5">
              <h2 className="text-sm font-semibold tracking-tight">Summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
            </div>

            {report.categoryBreakdown?.length > 0 && (
              <div className="surface-card p-5">
                <h2 className="text-sm font-semibold tracking-tight">Category Breakdown</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {report.categoryBreakdown.map((c) => (
                    <div key={c.category} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-sm">{c.category}</span>
                      <Badge variant="secondary" className="tabular-nums">{c.score}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-card p-5">
                <h2 className="text-sm font-semibold tracking-tight">Strengths</h2>
                <ul className="mt-3 space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface-card p-5">
                <h2 className="text-sm font-semibold tracking-tight">Improvements</h2>
                <ul className="mt-3 space-y-2">
                  {report.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {report.recommendations?.length > 0 && (
              <div className="surface-card p-5">
                <h2 className="text-sm font-semibold tracking-tight">Recommendations</h2>
                <ol className="mt-3 space-y-2">
                  {report.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{i + 1}.</span>
                      {r}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}

        <Button variant="accent" onClick={() => router.push("/mock-interview")}>
          Start New Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">{session.company} Interview</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 tabular-nums">
              <Clock className="h-3 w-3" />
              {formatTime(secondsLeft)}
            </Badge>
            <Badge variant="secondary">{session.role}</Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-1" />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs tabular-nums text-muted-foreground">
            Question {currentIndex + 1} of {session.questions.length}
          </p>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={handleAbandon}>
            Abandon
          </Button>
        </div>
      </div>

      {currentQuestion && (
        <div className="surface-card">
          <div className="border-b border-border px-5 py-4">
            <Badge variant="outline" className="text-[10px]">
              {currentQuestion.category}
            </Badge>
            <p className="mt-3 text-sm font-medium leading-relaxed">{currentQuestion.question}</p>
          </div>
          <div className="space-y-4 p-5">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="resize-none border-border/80"
            />
            <div className="flex gap-2">
              <Button variant="accent" onClick={handleSubmit} disabled={loading || !answer.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Answer
              </Button>
              <Button variant="outline" onClick={handleSkip} disabled={loading}>
                <SkipForward className="mr-2 h-4 w-4" />
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}

      {lastEval && (
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Feedback</h2>
            <Badge variant="accent" className="tabular-nums">
              {lastEval.overallScore}%
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: "Technical", value: lastEval.technicalAccuracy },
              { label: "Communication", value: lastEval.communication },
              { label: "Confidence", value: lastEval.confidence },
              { label: "Completeness", value: lastEval.completeness },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/60 px-2 py-2.5 text-center">
                <p className="text-lg font-semibold tabular-nums">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lastEval.feedback}</p>
        </div>
      )}
    </div>
  );
}
