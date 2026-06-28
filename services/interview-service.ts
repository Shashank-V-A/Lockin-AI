import { prisma } from "@/lib/prisma";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewReport,
} from "@/services/ai-service";
import type { AnswerEvaluation, InterviewReport } from "@/types/interview";

/** Creates a new mock interview session with AI-generated questions. */
export async function createInterviewSession(params: {
  userId: string;
  company: string;
  role: string;
  experience: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}) {
  const questions = await generateInterviewQuestions({
    company: params.company,
    role: params.role,
    experience: params.experience,
    difficulty: params.difficulty,
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

/** Submits and evaluates an interview answer. */
export async function submitInterviewAnswer(params: {
  sessionId: string;
  questionId: string;
  answer: string;
  company: string;
  role: string;
  question: string;
}) {
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

/** Completes session and generates final report. */
export async function completeInterviewSession(sessionId: string) {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      questions: { orderBy: { order: "asc" } },
      answers: true,
    },
  });

  if (!session) throw new Error("Session not found");

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
