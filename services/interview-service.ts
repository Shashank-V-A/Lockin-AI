import { prisma } from "@/lib/prisma";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewReport,
} from "@/services/ai-service";
import { getLatestResumeForUser } from "@/services/resume-service";
import type { AnswerEvaluation, InterviewReport } from "@/types/interview";

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

/** Submits and evaluates an interview answer (ownership verified). */
export async function submitInterviewAnswer(params: {
  userId: string;
  sessionId: string;
  questionId: string;
  answer: string;
  company: string;
  role: string;
  question: string;
}) {
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

  return prisma.interviewAnswer.create({
    data: {
      sessionId: params.sessionId,
      questionId: params.questionId,
      answer: params.answer,
      technicalAccuracy: evaluation.technicalAccuracy,
      communication: evaluation.communication,
      confidence: evaluation.confidence,
      completeness: evaluation.completeness,
      overallScore: evaluation.overallScore,
      feedback: evaluation.feedback,
    },
  });
}

/** Skips current question without scoring. */
export async function skipInterviewQuestion(params: {
  userId: string;
  sessionId: string;
  questionId: string;
}) {
  const session = await getOwnedSession(params.sessionId, params.userId);
  if (session.status !== "IN_PROGRESS") throw new Error("Interview session is not active");

  const question = session.questions.find((q) => q.id === params.questionId);
  if (!question) throw new Error("Question not found");

  const existing = session.answers.find((a) => a.questionId === params.questionId);
  if (existing) throw new Error("Question already answered");

  return prisma.interviewAnswer.create({
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
    },
  });
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

  const qaPairs = session.questions.map((q) => {
    const answer = session.answers.find((a) => a.questionId === q.id);
    return {
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
    };
  });

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
      answers: true,
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
