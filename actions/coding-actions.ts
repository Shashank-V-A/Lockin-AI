"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getCodingProblems,
  getCodingProblem,
  submitCodingSolution,
  runCodingSolution,
  getUserSubmissions,
} from "@/services/coding-service";

/** Fetches all coding problems. */
export async function fetchCodingProblems() {
  return getCodingProblems();
}

/** Fetches a coding problem by slug. */
export async function fetchCodingProblem(slug: string) {
  return getCodingProblem(slug);
}

/** Runs code against test cases without saving. */
export async function runCode(params: {
  problemId: string;
  language: string;
  code: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return runCodingSolution(params);
}

/** Submits coding solution for evaluation. */
export async function submitCode(params: {
  problemId: string;
  language: string;
  code: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await submitCodingSolution({
    userId: session.user.id,
    ...params,
  });

  revalidatePath("/coding");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  return result;
}

/** Gets user's coding submissions. */
export async function fetchUserSubmissions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getUserSubmissions(session.user.id);
}
