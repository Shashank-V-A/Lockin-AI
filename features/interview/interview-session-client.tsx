"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  submitAnswer,
  submitFollowUp,
  skipFollowUp,
  finishInterview,
  skipQuestion,
  abandonInterview,
  pauseInterview,
  resumeInterview,
  syncInterviewTime,
} from "@/actions/interview-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { toastActionError } from "@/lib/client-toast";
import type { ActionResult } from "@/lib/action-result";
import { Clock, Loader2, SkipForward, Pause, Play, Download, MessageCircle } from "lucide-react";
import type { InterviewReport } from "@/types/interview";

function handleInterviewActionError(
  result: ActionResult<unknown>,
  router: ReturnType<typeof useRouter>,
): boolean {
  if (result.ok) return false;
  if (result.code === "SESSION_INACTIVE") {
    toast.error(result.error);
    router.push("/mock-interview");
    return true;
  }
  if (result.code === "VALIDATION" && result.error.includes("already submitted")) {
    toast.info(result.error);
    router.refresh();
    return true;
  }
  return toastActionError(result);
}

const SESSION_MINUTES = 45;

type SessionAnswer = {
  questionId: string;
  overallScore: number | null;
  feedback: string | null;
  technicalAccuracy: number | null;
  communication: number | null;
  confidence: number | null;
  completeness: number | null;
  followUpQuestion: string | null;
  followUpAnswer: string | null;
  followUpScore: number | null;
  followUpFeedback: string | null;
  followUpSkipped: boolean;
};

interface InterviewSessionClientProps {
  session: {
    id: string;
    company: string;
    role: string;
    status: string;
    overallScore: number | null;
    report: unknown;
    remainingSeconds: number;
    isPaused: boolean;
    questions: { id: string; order: number; question: string; category: string }[];
    answers: SessionAnswer[];
  };
}

function isAnswerComplete(answer: SessionAnswer | undefined): boolean {
  if (!answer) return false;
  if (answer.followUpQuestion && !answer.followUpAnswer && !answer.followUpSkipped) {
    return false;
  }
  return true;
}

/** Active mock interview session UI with follow-ups, pause/resume. */
export function InterviewSessionClient({ session }: InterviewSessionClientProps) {
  const router = useRouter();

  const getAnswer = (questionId: string) =>
    session.answers.find((a) => a.questionId === questionId);

  const completedCount = session.questions.filter((q) =>
    isAnswerComplete(getAnswer(q.id)),
  ).length;

  const currentIndex = session.questions.findIndex(
    (q) => !isAnswerComplete(getAnswer(q.id)),
  );
  const currentQuestion = currentIndex >= 0 ? session.questions[currentIndex] : null;
  const isComplete = session.status === "COMPLETED" || currentIndex === -1;

  const pendingFromServer = (() => {
    if (!currentQuestion) return null;
    const ans = getAnswer(currentQuestion.id);
    if (ans?.followUpQuestion && !ans.followUpAnswer && !ans.followUpSkipped) {
      return { questionId: currentQuestion.id, text: ans.followUpQuestion };
    }
    return null;
  })();

  const [answer, setAnswer] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [followUpPhase, setFollowUpPhase] = useState<{ questionId: string; text: string } | null>(
    pendingFromServer,
  );
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(session.remainingSeconds ?? SESSION_MINUTES * 60);
  const [isPaused, setIsPaused] = useState(session.isPaused);
  const [downloading, setDownloading] = useState(false);
  const syncRef = useRef(0);
  const [lastEval, setLastEval] = useState<{
    overallScore: number;
    feedback: string;
    technicalAccuracy: number;
    communication: number;
    confidence: number;
    completeness: number;
  } | null>(() => {
    if (!pendingFromServer) return null;
    const ans = getAnswer(pendingFromServer.questionId);
    if (!ans) return null;
    return {
      overallScore: ans.overallScore ?? 0,
      feedback: ans.feedback ?? "",
      technicalAccuracy: ans.technicalAccuracy ?? 0,
      communication: ans.communication ?? 0,
      confidence: ans.confidence ?? 0,
      completeness: ans.completeness ?? 0,
    };
  });

  const progress = (completedCount / session.questions.length) * 100;

  const handleFinish = useCallback(async () => {
    const result = await finishInterview(session.id);
    if (handleInterviewActionError(result, router)) return;
    toast.success("Interview complete!");
    router.refresh();
  }, [session.id, router]);

  const advanceAfterQuestion = useCallback(
    async (isLast: boolean) => {
      setFollowUpPhase(null);
      setFollowUpAnswer("");
      setLastEval(null);
      if (isLast) {
        await handleFinish();
      } else {
        toast.success("Moving to next question");
        router.refresh();
      }
    },
    [handleFinish, router],
  );

  useEffect(() => {
    if (isComplete || session.status !== "IN_PROGRESS" || isPaused) return;

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
  }, [isComplete, session.status, isPaused, handleFinish]);

  useEffect(() => {
    if (isComplete || isPaused) return;
    const now = Date.now();
    if (now - syncRef.current < 30000) return;
    syncRef.current = now;
    syncInterviewTime(session.id, secondsLeft).catch(() => {});
  }, [secondsLeft, isComplete, isPaused, session.id]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handlePause = async () => {
    try {
      await pauseInterview(session.id, secondsLeft);
      setIsPaused(true);
      toast.info("Interview paused");
    } catch {
      toast.error("Failed to pause");
    }
  };

  const handleResume = async () => {
    try {
      await resumeInterview(session.id);
      setIsPaused(false);
      toast.success("Interview resumed");
    } catch {
      toast.error("Failed to resume");
    }
  };

  const handleDownloadReport = async () => {
    const report = session.report as InterviewReport | null;
    if (!report || session.overallScore === null) return;
    setDownloading(true);
    try {
      const { generateInterviewPDF } = await import("@/lib/pdf");
      await generateInterviewPDF(session.company, session.role, session.overallScore, report);
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

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

      if (!result.ok) {
        handleInterviewActionError(result, router);
        return;
      }

      const data = result.data;
      setLastEval({
        overallScore: data.overallScore ?? 0,
        feedback: data.feedback ?? "",
        technicalAccuracy: data.technicalAccuracy ?? 0,
        communication: data.communication ?? 0,
        confidence: data.confidence ?? 0,
        completeness: data.completeness ?? 0,
      });
      setAnswer("");

      if (data.followUpQuestion) {
        setFollowUpPhase({ questionId: currentQuestion.id, text: data.followUpQuestion });
      } else {
        await advanceAfterQuestion(currentIndex === session.questions.length - 1);
      }
    } catch {
      toast.error("Couldn't save your answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFollowUp = async () => {
    if (!followUpPhase || !followUpAnswer.trim()) return;

    setLoading(true);
    try {
      const result = await submitFollowUp({
        sessionId: session.id,
        questionId: followUpPhase.questionId,
        answer: followUpAnswer,
        company: session.company,
        role: session.role,
      });

      if (handleInterviewActionError(result, router)) return;
      await advanceAfterQuestion(currentIndex === session.questions.length - 1);
    } catch {
      toast.error("Couldn't save your follow-up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipFollowUp = async () => {
    if (!followUpPhase) return;
    setLoading(true);
    try {
      const result = await skipFollowUp({
        sessionId: session.id,
        questionId: followUpPhase.questionId,
      });
      if (handleInterviewActionError(result, router)) return;
      await advanceAfterQuestion(currentIndex === session.questions.length - 1);
    } catch {
      toast.error("Failed to skip follow-up");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;
    setLoading(true);
    try {
      const result = await skipQuestion({
        sessionId: session.id,
        questionId: currentQuestion.id,
      });
      if (handleInterviewActionError(result, router)) return;

      setAnswer("");
      setFollowUpPhase(null);
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
      const result = await abandonInterview(session.id);
      if (handleInterviewActionError(result, router)) return;
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
          <div className="flex items-center gap-2">
            {session.overallScore !== null && (
              <Badge variant="accent" className="px-3 py-1 text-base tabular-nums">
                {session.overallScore}%
              </Badge>
            )}
            {report && (
              <Button variant="outline" size="sm" disabled={downloading} onClick={handleDownloadReport}>
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            )}
          </div>
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
            {isPaused ? (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleResume}>
                <Play className="h-3 w-3" />
                Resume
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handlePause}>
                <Pause className="h-3 w-3" />
                Pause
              </Button>
            )}
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

      {currentQuestion && !lastEval && (
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

      {currentQuestion && lastEval && (
        <div className="surface-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {currentQuestion.category}
              </Badge>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Original question
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {currentQuestion.question}
            </p>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Your evaluation</h2>
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

          {followUpPhase && (
            <>
              <div className="border-t border-border" />
              <div className="bg-accent/[0.04] px-5 py-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10">
                    <MessageCircle className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Interviewer follow-up
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      One more question based on your answer
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium leading-relaxed">{followUpPhase.text}</p>
                <div className="mt-4 space-y-4">
                  <Textarea
                    value={followUpAnswer}
                    onChange={(e) => setFollowUpAnswer(e.target.value)}
                    placeholder="Clarify, give an example, or explain trade-offs..."
                    rows={4}
                    className="resize-none border-border/80 bg-background/80"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="accent"
                      onClick={handleSubmitFollowUp}
                      disabled={loading || !followUpAnswer.trim()}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Follow-up
                    </Button>
                    <Button variant="outline" onClick={handleSkipFollowUp} disabled={loading}>
                      Skip Follow-up
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
