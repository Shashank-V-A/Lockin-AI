"use server";

import { requireUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  getCodingPageData,
  getCodingProblemPageData,
  submitCodingSolution,
  runCodingSolution,
  getCodingHint,
  getCodingSolution,
  toggleCodingBookmark,
  saveCodingDraft,
} from "@/services/coding-service";
import { codeSubmissionSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { invalidateDashboardCache } from "@/lib/redis";
import { withActionResult } from "@/lib/action-wrapper";

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
