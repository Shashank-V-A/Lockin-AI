"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createInterviewSession,
  submitInterviewAnswer,
  completeInterviewSession,
  getInterviewSession,
  getRecentInterviews,
} from "@/services/interview-service";

/** Starts a new mock interview session. */
export async function startInterview(params: {
  company: string;
  role: string;
  experience: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const interview = await createInterviewSession({
    userId: session.user.id,
    ...params,
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

  const result = await submitInterviewAnswer(params);
  revalidatePath("/mock-interview");
  return result;
}

/** Completes interview and generates report. */
export async function finishInterview(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await completeInterviewSession(sessionId);
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
