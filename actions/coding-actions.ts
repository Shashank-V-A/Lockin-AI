"use server";

import { requireUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  getCodingProblems,
  getCodingProblem,
  getCodingPageData,
  getCodingProblemPageData,
  submitCodingSolution,
  runCodingSolution,
  getUserSubmissions,
  getCodingProgress,
  getCodingHint,
  getCodingSolution,
  getBookmarkedProblemIds,
  toggleCodingBookmark,
  saveCodingDraft,
  getCodingDraft,
} from "@/services/coding-service";
import { codeSubmissionSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { invalidateDashboardCache } from "@/lib/redis";
import { withActionResult } from "@/lib/action-wrapper";

/** Fetches all coding problems. */
export async function fetchCodingProblems() {
  await requireUserId();
  return getCodingProblems();
}

/** Batched coding listing page data (single auth check). */
export async function fetchCodingPageData() {
  const userId = await requireUserId();
  return getCodingPageData(userId);
}

/** Batched coding problem page data (single auth check). */
export async function fetchCodingProblemPageData(slug: string) {
  const userId = await requireUserId();
  return getCodingProblemPageData(userId, slug);
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
  const userId = await requireUserId();
  await enforceRateLimit(userId, "coding-run");
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
    const userId = await requireUserId();
    await enforceRateLimit(userId, "coding");
    codeSubmissionSchema.parse(params.code);

    const result = await submitCodingSolution({
      userId,
      ...params,
    });

    await invalidateDashboardCache(userId);
    revalidatePath("/coding");
    revalidatePath("/dashboard");
    return result;
  });
}

/** Gets user's coding submissions. */
export async function fetchUserSubmissions() {
  const userId = await requireUserId();
  return getUserSubmissions(userId);
}

/** Gets user's solved/unsolved coding progress. */
export async function fetchCodingProgress() {
  const userId = await requireUserId();
  return getCodingProgress(userId);
}

/** Reveals a hint for a coding problem (requires prior attempt). */
export async function revealCodingHint(problemId: string) {
  const userId = await requireUserId();
  return getCodingHint(userId, problemId);
}

/** Reveals the official solution (requires prior attempt). */
export async function revealCodingSolution(problemId: string, language: string) {
  const userId = await requireUserId();
  return getCodingSolution(userId, problemId, language);
}

/** Gets bookmarked problem IDs. */
export async function fetchBookmarkedProblems() {
  const userId = await requireUserId();
  return getBookmarkedProblemIds(userId);
}

/** Toggles bookmark on a problem. */
export async function toggleBookmark(problemId: string) {
  const userId = await requireUserId();
  return toggleCodingBookmark(userId, problemId);
}

/** Saves in-progress code draft. */
export async function saveDraft(params: {
  problemId: string;
  language: string;
  code: string;
}) {
  const userId = await requireUserId();
  codeSubmissionSchema.parse(params.code);
  return saveCodingDraft({ userId, ...params });
}

/** Gets saved draft for a problem. */
export async function fetchDraft(problemId: string) {
  const userId = await requireUserId();
  return getCodingDraft(userId, problemId);
}
