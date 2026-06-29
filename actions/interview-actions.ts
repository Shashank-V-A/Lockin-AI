"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createInterviewSession,
  submitInterviewAnswer,
  completeInterviewSession,
  getInterviewSession,
  getRecentInterviews,
  skipInterviewQuestion,
  abandonInterviewSession,
} from "@/services/interview-service";
import { startInterviewSchema, interviewAnswerSchema } from "@/lib/validations";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

/** Starts a new mock interview session. */
export async function startInterview(params: {
  company: string;
  role: string;
  experience: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await enforceRateLimit(session.user.id, "interview");
  const validated = startInterviewSchema.parse(params);

  const interview = await createInterviewSession({
    userId: session.user.id,
    ...validated,
  });

  revalidatePath("/mock-interview");
  return interview;
}

/** Submits an answer for evaluation. */
export async function submitAnswer(params: {
  sessionId: string;
  questionId: string;
  answer: string;
  company: string;
  role: string;
  question: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await enforceRateLimit(session.user.id, "interview");
  const answer = interviewAnswerSchema.parse(params.answer);

  const result = await submitInterviewAnswer({
    userId: session.user.id,
    sessionId: params.sessionId,
    questionId: params.questionId,
    answer,
    company: params.company,
    role: params.role,
    question: params.question,
  });
  revalidatePath("/mock-interview");
  return result;
}

/** Skips a question. */
export async function skipQuestion(params: { sessionId: string; questionId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await skipInterviewQuestion({
    userId: session.user.id,
    ...params,
  });
  revalidatePath("/mock-interview");
  return result;
}

/** Abandons an in-progress interview. */
export async function abandonInterview(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await abandonInterviewSession(sessionId, session.user.id);
  revalidatePath("/mock-interview");
  return result;
}

/** Completes interview and generates report. */
export async function finishInterview(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await completeInterviewSession(sessionId, session.user.id);
  revalidatePath("/mock-interview");
  revalidatePath("/dashboard");
  return result;
}

/** Gets interview session data. */
export async function fetchInterviewSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getInterviewSession(sessionId, session.user.id);
}

/** Gets recent interviews for dashboard. */
export async function fetchRecentInterviews() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getRecentInterviews(session.user.id);
}

export { RateLimitError };
