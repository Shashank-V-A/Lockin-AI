import { prisma } from "@/lib/prisma";
import { runCodeTests } from "@/lib/code-runner";
import { analyzeCodingSubmission } from "@/services/ai-service";
import { resolveCodingHint, extractApproachFromStoredSolution, resolveOfficialSolution } from "@/lib/coding-hints-solutions";
import { cached } from "@/lib/redis";
import { unstable_cache } from "next/cache";
import type { CodingFeedback, TestCase } from "@/types/coding";

const getCachedCodingProblems = unstable_cache(
  async () =>
    prisma.codingProblem.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        topic: true,
      },
      orderBy: [{ difficulty: "asc" }, { title: "asc" }],
    }),
  ["coding-problems-list"],
  { revalidate: 3600, tags: ["coding-problems"] },
);

/** Gets all coding problems. */
export async function getCodingProblems() {
  return getCachedCodingProblems();
}

/** Gets a coding problem by slug (excludes solution and test cases). */
export async function getCodingProblem(slug: string) {
  return prisma.codingProblem.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      difficulty: true,
      topic: true,
      starterCode: true,
      timeLimit: true,
    },
  });
}

/** Runs code against test cases without saving a submission. */
export async function runCodingSolution(params: {
  problemId: string;
  language: string;
  code: string;
}) {
  const problem = await prisma.codingProblem.findUnique({
    where: { id: params.problemId },
  });
  if (!problem) throw new Error("Problem not found");

  const testCases = problem.testCases as unknown as TestCase[];
  return runCodeTests({
    code: params.code,
    language: params.language,
    slug: problem.slug,
    testCases,
  });
}

/** Submits and evaluates coding solution. */
export async function submitCodingSolution(params: {
  userId: string;
  problemId: string;
  language: string;
  code: string;
}) {
  const problem = await prisma.codingProblem.findUnique({
    where: { id: params.problemId },
  });
  if (!problem) throw new Error("Problem not found");

  const testCases = problem.testCases as unknown as TestCase[];
  const result = await runCodeTests({
    code: params.code,
    language: params.language,
    slug: problem.slug,
    testCases,
  });

  const passed = result.status === "PASSED";
  const score = Math.round((result.passedTests / result.totalTests) * 100);

  let feedback: CodingFeedback;
  try {
    feedback = await analyzeCodingSubmission({
      problem: problem.description,
      code: params.code,
      language: params.language,
      passed,
      testResults: result.testResults,
    });
  } catch {
    feedback = {
      betterSolution: passed ? "" : "Review the failing test cases and edge conditions.",
      timeComplexity: passed ? "O(n)" : "—",
      spaceComplexity: passed ? "O(n)" : "—",
      mistakes: passed ? [] : ["Some test cases did not pass."],
      summary: passed
        ? "All tests passed. AI feedback was unavailable — submission saved."
        : "Submission saved. Review test output for details.",
    };
  }

  const submission = await prisma.codingSubmission.create({
    data: {
      userId: params.userId,
      problemId: params.problemId,
      language: params.language,
      code: params.code,
      status: result.status,
      runtime: result.runtime,
      memory: result.memory,
      score,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      aiFeedback: { ...feedback, testResults: result.testResults, compileError: result.compileError } as object,
    },
    include: { problem: true },
  });

  return {
    submission,
    feedback: feedback as CodingFeedback,
    testResults: result.testResults,
    compileError: result.compileError,
  };
}

/** Gets user coding submissions. */
export async function getUserSubmissions(userId: string, limit = 10) {
  return prisma.codingSubmission.findMany({
    where: { userId },
    include: { problem: { select: { title: true, topic: true, difficulty: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Gets average coding score for a user. */
export async function getAverageCodingScore(userId: string): Promise<number> {
  const result = await prisma.codingSubmission.aggregate({
    where: { userId, score: { not: null } },
    _avg: { score: true },
  });
  return Math.round(result._avg.score ?? 0);
}

export interface CodingProgress {
  total: number;
  solved: number;
  attempted: number;
  unsolved: number;
  solvedIds: string[];
  attemptedIds: string[];
  byDifficulty: { easy: number; medium: number; hard: number };
}

/** Gets user coding progress across all problems. */
export async function getCodingProgress(userId: string): Promise<CodingProgress> {
  return cached(`coding:progress:${userId}`, 60, async () => {
    const [problems, submissions] = await Promise.all([
      prisma.codingProblem.findMany({
        select: { id: true, difficulty: true },
      }),
      prisma.codingSubmission.findMany({
        where: { userId },
        select: { problemId: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    const latestByProblem = new Map<string, string>();
    for (const sub of submissions) {
      if (!latestByProblem.has(sub.problemId)) {
        latestByProblem.set(sub.problemId, sub.status);
      }
    }

    const solvedIds: string[] = [];
    const attemptedIds: string[] = [];
    for (const [problemId, status] of latestByProblem) {
      attemptedIds.push(problemId);
      if (status === "PASSED") solvedIds.push(problemId);
    }

    const solvedSet = new Set(solvedIds);
    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    for (const p of problems) {
      if (!solvedSet.has(p.id)) continue;
      if (p.difficulty === "EASY") byDifficulty.easy++;
      else if (p.difficulty === "MEDIUM") byDifficulty.medium++;
      else byDifficulty.hard++;
    }

    const solved = solvedIds.length;
    const total = problems.length;

    return {
      total,
      solved,
      attempted: attemptedIds.length,
      unsolved: total - solved,
      solvedIds,
      attemptedIds,
      byDifficulty,
    };
  });
}

/** Batched data for the coding problems listing page. */
export async function getCodingPageData(userId: string) {
  const [problems, progress, bookmarkIds] = await Promise.all([
    getCodingProblems(),
    getCodingProgress(userId),
    getBookmarkedProblemIds(userId),
  ]);

  return { problems, progress, bookmarkIds };
}

/** Batched data for an individual coding problem page. */
export async function getCodingProblemPageData(userId: string, slug: string) {
  const problem = await getCodingProblem(slug);
  if (!problem) return null;

  const [draft, bookmarkIds] = await Promise.all([
    getCodingDraft(userId, problem.id),
    getBookmarkedProblemIds(userId),
  ]);

  return {
    problem,
    draft,
    bookmarked: bookmarkIds.includes(problem.id),
  };
}

/** Returns a hint after the user has at least one submission attempt. */
export async function getCodingHint(userId: string, problemId: string) {
  const attempt = await prisma.codingSubmission.findFirst({
    where: { userId, problemId },
  });
  if (!attempt) throw new Error("Submit at least one attempt to unlock hints");

  const problem = await prisma.codingProblem.findUnique({
    where: { id: problemId },
    select: { hint: true, solution: true, title: true, slug: true },
  });
  if (!problem) throw new Error("Problem not found");

  const approach = problem.solution?.split("\n")[0]?.replace(/^Approach:\s*/, "") ?? "";
  const hint = problem.hint ?? resolveCodingHint(problem.slug, approach);

  return { hint };
}

/** Returns the official solution after a failed or partial submission. */
export async function getCodingSolution(
  userId: string,
  problemId: string,
  language: string,
) {
  const attempt = await prisma.codingSubmission.findFirst({
    where: { userId, problemId, status: { in: ["FAILED", "ERROR"] } },
  });
  const passed = await prisma.codingSubmission.findFirst({
    where: { userId, problemId, status: "PASSED" },
  });
  if (!attempt && !passed) {
    throw new Error("Attempt the problem before revealing the solution");
  }

  const problem = await prisma.codingProblem.findUnique({
    where: { id: problemId },
    select: { slug: true, solution: true },
  });
  if (!problem?.solution) throw new Error("No solution available");

  const approach = extractApproachFromStoredSolution(problem.solution);

  return {
    solution: resolveOfficialSolution(problem.slug, language, approach),
  };
}

/** Gets bookmarked problem IDs for a user. */
export async function getBookmarkedProblemIds(userId: string): Promise<string[]> {
  const rows = await prisma.codingBookmark.findMany({
    where: { userId },
    select: { problemId: true },
  });
  return rows.map((r) => r.problemId);
}

/** Toggles bookmark on a coding problem. Returns new bookmarked state. */
export async function toggleCodingBookmark(
  userId: string,
  problemId: string,
): Promise<boolean> {
  const existing = await prisma.codingBookmark.findUnique({
    where: { userId_problemId: { userId, problemId } },
  });

  if (existing) {
    await prisma.codingBookmark.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.codingBookmark.create({ data: { userId, problemId } });
  return true;
}

/** Saves in-progress code for a problem. */
export async function saveCodingDraft(params: {
  userId: string;
  problemId: string;
  language: string;
  code: string;
}) {
  return prisma.codingDraft.upsert({
    where: {
      userId_problemId: {
        userId: params.userId,
        problemId: params.problemId,
      },
    },
    create: {
      userId: params.userId,
      problemId: params.problemId,
      language: params.language,
      code: params.code,
    },
    update: {
      language: params.language,
      code: params.code,
    },
  });
}

/** Gets saved draft for a problem, if any. */
export async function getCodingDraft(userId: string, problemId: string) {
  return prisma.codingDraft.findUnique({
    where: { userId_problemId: { userId, problemId } },
    select: { language: true, code: true, updatedAt: true },
  });
}
