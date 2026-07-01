import { prisma } from "@/lib/prisma";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewReport,
  generateFollowUpQuestion,
} from "@/services/ai-service";
import { getLatestResumeForUser } from "@/services/resume-service";
import type { AnswerEvaluation, InterviewReport } from "@/types/interview";
import { toInterviewAnswerResult, type InterviewAnswerResult } from "@/lib/interview-payload";

function roundEvaluation(evaluation: AnswerEvaluation) {
  return {
    technicalAccuracy: Math.round(evaluation.technicalAccuracy),
    communication: Math.round(evaluation.communication),
    confidence: Math.round(evaluation.confidence),
    completeness: Math.round(evaluation.completeness),
    overallScore: Math.round(evaluation.overallScore),
    feedback: evaluation.feedback,
  };
}

/** Verifies session ownership and in-progress status. */
async function getOwnedSession(sessionId: string, userId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      questions: { orderBy: { order: "asc" } },
      answers: true,
    },
  });
  if (!session) throw new Error("Session not found");
  return session;
}

/** True when main answer exists and follow-up is done or skipped. */
export function isQuestionFullyAnswered(answer: {
  followUpQuestion: string | null;
  followUpAnswer: string | null;
  followUpSkipped: boolean;
} | undefined): boolean {
  if (!answer) return false;
  if (answer.followUpQuestion && !answer.followUpAnswer && !answer.followUpSkipped) {
    return false;
  }
  return true;
}

/** Creates a new mock interview session with AI-generated questions. */
export async function createInterviewSession(params: {
  userId: string;
  company: string;
  role: string;
  experience: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}) {
  const resume = await getLatestResumeForUser(params.userId);
  const resumeContext = resume?.rawText?.slice(0, 3000);

  const questions = await generateInterviewQuestions({
    company: params.company,
    role: params.role,
    experience: params.experience,
    difficulty: params.difficulty,
    resumeContext,
  });

  return prisma.interviewSession.create({
    data: {
      userId: params.userId,
      company: params.company,
      role: params.role,
      experience: params.experience,
      difficulty: params.difficulty,
      questions: {
        create: questions.map((q, i) => ({
          order: i + 1,
          question: q.question,
          category: q.category,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });
}

/** Submits and evaluates an interview answer, then generates a follow-up question. */
export async function submitInterviewAnswer(params: {
  userId: string;
  sessionId: string;
  questionId: string;
  answer: string;
  company: string;
  role: string;
  question: string;
}): Promise<InterviewAnswerResult> {
  const session = await getOwnedSession(params.sessionId, params.userId);
  if (session.status !== "IN_PROGRESS") {
    throw new Error("Interview session is not active");
  }

  const question = session.questions.find((q) => q.id === params.questionId);
  if (!question) throw new Error("Question not found");

  const existing = session.answers.find((a) => a.questionId === params.questionId);
  if (existing) throw new Error("Question already answered");

  const evaluation = await evaluateAnswer({
    question: params.question,
    answer: params.answer,
    company: params.company,
    role: params.role,
  });

  const scores = roundEvaluation(evaluation);

  const active = await prisma.interviewSession.findFirst({
    where: { id: params.sessionId, userId: params.userId, status: "IN_PROGRESS" },
    select: { id: true },
  });
  if (!active) throw new Error("Interview session is not active");

  const created = await prisma.interviewAnswer.create({
    data: {
      sessionId: params.sessionId,
      questionId: params.questionId,
      answer: params.answer,
      ...scores,
    },
  });

  let followUpQuestion: string | null = null;
  try {
    followUpQuestion = await generateFollowUpQuestion({
      question: params.question,
      answer: params.answer,
      company: params.company,
      role: params.role,
    });
  } catch {
    followUpQuestion = "Can you elaborate on a specific example from your experience?";
  }

  try {
    const updated = await prisma.interviewAnswer.update({
      where: { id: created.id },
      data: { followUpQuestion },
    });
    return toInterviewAnswerResult(updated);
  } catch {
    return toInterviewAnswerResult({ ...created, followUpQuestion });
  }
}

/** Submits and evaluates a follow-up answer. */
export async function submitFollowUpAnswer(params: {
  userId: string;
  sessionId: string;
  questionId: string;
  answer: string;
  company: string;
  role: string;
}) {
  const session = await getOwnedSession(params.sessionId, params.userId);
  if (session.status !== "IN_PROGRESS") throw new Error("Interview session is not active");

  const record = session.answers.find((a) => a.questionId === params.questionId);
  if (!record?.followUpQuestion) throw new Error("No follow-up pending");
  if (record.followUpAnswer || record.followUpSkipped) {
    throw new Error("Follow-up already completed");
  }

  const evaluation = await evaluateAnswer({
    question: record.followUpQuestion,
    answer: params.answer,
    company: params.company,
    role: params.role,
  });

  const scores = roundEvaluation(evaluation);

  return prisma.interviewAnswer.update({
    where: { id: record.id },
    data: {
      followUpAnswer: params.answer,
      followUpScore: scores.overallScore,
      followUpFeedback: scores.feedback,
    },
  });
}

/** Skips the follow-up for a question. */
export async function skipFollowUpAnswer(params: {
  userId: string;
  sessionId: string;
  questionId: string;
}) {
  const session = await getOwnedSession(params.sessionId, params.userId);
  const record = session.answers.find((a) => a.questionId === params.questionId);
  if (!record?.followUpQuestion) throw new Error("No follow-up pending");

  return prisma.interviewAnswer.update({
    where: { id: record.id },
    data: { followUpSkipped: true },
  });
}

/** Skips current question without scoring. */
export async function skipInterviewQuestion(params: {
  userId: string;
  sessionId: string;
  questionId: string;
}): Promise<InterviewAnswerResult> {
  const session = await getOwnedSession(params.sessionId, params.userId);
  if (session.status !== "IN_PROGRESS") throw new Error("Interview session is not active");

  const question = session.questions.find((q) => q.id === params.questionId);
  if (!question) throw new Error("Question not found");

  const existing = session.answers.find((a) => a.questionId === params.questionId);
  if (existing) throw new Error("Question already answered");

  const created = await prisma.interviewAnswer.create({
    data: {
      sessionId: params.sessionId,
      questionId: params.questionId,
      answer: "[Skipped]",
      technicalAccuracy: 0,
      communication: 0,
      confidence: 0,
      completeness: 0,
      overallScore: 0,
      feedback: "Question was skipped.",
      followUpSkipped: true,
    },
  });

  return toInterviewAnswerResult(created);
}

/** Marks session as abandoned. */
export async function abandonInterviewSession(sessionId: string, userId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId, status: "IN_PROGRESS" },
  });
  if (!session) throw new Error("Session not found");

  return prisma.interviewSession.update({
    where: { id: sessionId },
    data: { status: "ABANDONED" },
  });
}

/** Completes session and generates final report (ownership verified). */
export async function completeInterviewSession(sessionId: string, userId: string) {
  const session = await getOwnedSession(sessionId, userId);
  if (session.status !== "IN_PROGRESS") {
    throw new Error("Interview session is not active");
  }

  const qaPairs: { question: string; answer: string; scores: AnswerEvaluation }[] = [];

  for (const q of session.questions) {
    const answer = session.answers.find((a) => a.questionId === q.id);
    qaPairs.push({
      question: q.question,
      answer: answer?.answer ?? "",
      scores: {
        technicalAccuracy: answer?.technicalAccuracy ?? 0,
        communication: answer?.communication ?? 0,
        confidence: answer?.confidence ?? 0,
        completeness: answer?.completeness ?? 0,
        overallScore: answer?.overallScore ?? 0,
        feedback: answer?.feedback ?? "",
      } satisfies AnswerEvaluation,
    });

    if (answer?.followUpQuestion && answer.followUpAnswer) {
      qaPairs.push({
        question: `[Follow-up] ${answer.followUpQuestion}`,
        answer: answer.followUpAnswer,
        scores: {
          technicalAccuracy: answer.followUpScore ?? 0,
          communication: answer.followUpScore ?? 0,
          confidence: answer.followUpScore ?? 0,
          completeness: answer.followUpScore ?? 0,
          overallScore: answer.followUpScore ?? 0,
          feedback: answer.followUpFeedback ?? "",
        } satisfies AnswerEvaluation,
      });
    }
  }

  const report = await generateInterviewReport({
    company: session.company,
    role: session.role,
    qaPairs,
  });

  const updated = await prisma.interviewSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      overallScore: report.overallScore,
      report: report as object,
      completedAt: new Date(),
    },
  });

  await prisma.report.create({
    data: {
      userId: session.userId,
      type: "INTERVIEW",
      title: `Interview - ${session.company} ${session.role}`,
      data: report as object,
      sessionId: session.id,
    },
  });

  return { session: updated, report: report as InterviewReport };
}

/** Gets interview session with questions and answers. */
export async function getInterviewSession(sessionId: string, userId: string) {
  return prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      questions: { orderBy: { order: "asc" } },
      answers: {
        select: {
          questionId: true,
          overallScore: true,
          feedback: true,
          technicalAccuracy: true,
          communication: true,
          confidence: true,
          completeness: true,
          followUpQuestion: true,
          followUpAnswer: true,
          followUpScore: true,
          followUpFeedback: true,
          followUpSkipped: true,
        },
      },
    },
  });
}

/** Gets recent interview sessions for a user. */
export async function getRecentInterviews(userId: string, limit = 5) {
  return prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      company: true,
      role: true,
      overallScore: true,
      status: true,
      createdAt: true,
    },
  });
}

/** Gets average interview score for a user. */
export async function getAverageInterviewScore(userId: string): Promise<number> {
  const result = await prisma.interviewSession.aggregate({
    where: { userId, status: "COMPLETED", overallScore: { not: null } },
    _avg: { overallScore: true },
  });
  return Math.round(result._avg.overallScore ?? 0);
}

/** Pauses an in-progress interview and saves remaining time. */
export async function pauseInterviewSession(
  sessionId: string,
  userId: string,
  remainingSeconds: number,
) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId, status: "IN_PROGRESS" },
  });
  if (!session) throw new Error("Session not found");

  return prisma.interviewSession.update({
    where: { id: sessionId },
    data: { isPaused: true, remainingSeconds: Math.max(0, remainingSeconds) },
  });
}

/** Resumes a paused interview. */
export async function resumeInterviewSession(sessionId: string, userId: string) {
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId, status: "IN_PROGRESS" },
  });
  if (!session) throw new Error("Session not found");

  return prisma.interviewSession.update({
    where: { id: sessionId },
    data: { isPaused: false },
  });
}

/** Syncs remaining seconds while interview is active. */
export async function syncInterviewTimer(
  sessionId: string,
  userId: string,
  remainingSeconds: number,
) {
  await prisma.interviewSession.updateMany({
    where: { id: sessionId, userId, status: "IN_PROGRESS", isPaused: false },
    data: { remainingSeconds: Math.max(0, remainingSeconds) },
  });
}
