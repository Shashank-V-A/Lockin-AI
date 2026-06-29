"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getCodingProblems,
  getCodingProblem,
  submitCodingSolution,
  runCodingSolution,
  getUserSubmissions,
  getCodingProgress,
  getCodingHint,
  getCodingSolution,
} from "@/services/coding-service";
import { codeSubmissionSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { invalidateDashboardCache } from "@/lib/redis";
import { withActionResult } from "@/lib/action-wrapper";

/** Fetches all coding problems. */
export async function fetchCodingProblems() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
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
  await enforceRateLimit(session.user.id, "coding-run");
  codeSubmissionSchema.parse(params.code);
  return runCodingSolution(params);
}

/** Submits coding solution for evaluation. */
export async function submitCode(params: {
  problemId: string;
  language: string;
  code: string;
}) {
  return withActionResult(async () => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await enforceRateLimit(session.user.id, "coding");
    codeSubmissionSchema.parse(params.code);

    const result = await submitCodingSolution({
      userId: session.user.id,
      ...params,
    });

    await invalidateDashboardCache(session.user.id);
    revalidatePath("/coding");
    revalidatePath("/dashboard");
    return result;
  });
}

/** Gets user's coding submissions. */
export async function fetchUserSubmissions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getUserSubmissions(session.user.id);
}

/** Gets user's solved/unsolved coding progress. */
export async function fetchCodingProgress() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getCodingProgress(session.user.id);
}

/** Reveals a hint for a coding problem (requires prior attempt). */
export async function revealCodingHint(problemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getCodingHint(session.user.id, problemId);
}

/** Reveals the official solution (requires prior attempt). */
export async function revealCodingSolution(problemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getCodingSolution(session.user.id, problemId);
}
