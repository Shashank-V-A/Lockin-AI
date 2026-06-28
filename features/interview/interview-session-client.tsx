"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, finishInterview } from "@/actions/interview-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { InterviewReport } from "@/types/interview";

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
  const [lastEval, setLastEval] = useState<{
    overallScore: number;
    feedback: string;
    technicalAccuracy: number;
    communication: number;
    confidence: number;
    completeness: number;
  } | null>(null);

  const progress = (session.answers.length / session.questions.length) * 100;

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
        await finishInterview(session.id);
        toast.success("Interview complete!");
        router.refresh();
      } else {
        toast.success("Answer evaluated");
        router.refresh();
      }
    } catch {
      toast.error("Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  if (isComplete) {
    const report = session.report as InterviewReport | null;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Interview Complete</h1>
            <p className="text-sm text-muted-foreground">
              {session.company} — {session.role}
            </p>
          </div>
          {session.overallScore !== null && (
            <Badge className="text-lg px-4 py-1" style={{ backgroundColor: "#4F46E5" }}>
              {session.overallScore}%
            </Badge>
          )}
        </div>

        {report && (
          <>
            <Card>
              <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{report.summary}</p></CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Strengths</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Improvements</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {report.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Button onClick={() => router.push("/mock-interview")}>Start New Interview</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{session.company} Interview</h1>
          <Badge variant="secondary">{session.role}</Badge>
        </div>
        <Progress value={progress} className="mt-4 h-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          Question {currentIndex + 1} of {session.questions.length}
        </p>
      </div>

      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentQuestion.category}</Badge>
            </div>
            <CardTitle className="text-base leading-relaxed mt-2">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="resize-none"
            />
            <Button onClick={handleSubmit} disabled={loading || !answer.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      )}

      {lastEval && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feedback — {lastEval.overallScore}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Technical", value: lastEval.technicalAccuracy },
                { label: "Communication", value: lastEval.communication },
                { label: "Confidence", value: lastEval.confidence },
                { label: "Completeness", value: lastEval.completeness },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-border p-2 text-center">
                  <p className="text-lg font-semibold">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{lastEval.feedback}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
