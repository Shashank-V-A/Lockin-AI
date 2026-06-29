import { prisma } from "@/lib/prisma";
import { runCodeTests } from "@/lib/code-runner";
import { analyzeCodingSubmission } from "@/services/ai-service";
import type { CodingFeedback, TestCase } from "@/types/coding";

/** Gets all coding problems. */
export async function getCodingProblems() {
  return prisma.codingProblem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      topic: true,
    },
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
  });
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

  const feedback = await analyzeCodingSubmission({
    problem: problem.description,
    code: params.code,
    language: params.language,
    passed,
    testResults: result.testResults,
  });

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
  const [problems, passedSubs, allSubs] = await Promise.all([
    prisma.codingProblem.findMany({
      select: { id: true, difficulty: true },
    }),
    prisma.codingSubmission.findMany({
      where: { userId, status: "PASSED" },
      select: { problemId: true },
      distinct: ["problemId"],
    }),
    prisma.codingSubmission.findMany({
      where: { userId },
      select: { problemId: true },
      distinct: ["problemId"],
    }),
  ]);

  const solvedIds = passedSubs.map((s) => s.problemId);
  const attemptedIds = allSubs.map((s) => s.problemId);
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
}

/** Returns a hint after the user has at least one submission attempt. */
export async function getCodingHint(userId: string, problemId: string) {
  const attempt = await prisma.codingSubmission.findFirst({
    where: { userId, problemId },
  });
  if (!attempt) throw new Error("Submit at least one attempt to unlock hints");

  const problem = await prisma.codingProblem.findUnique({
    where: { id: problemId },
    select: { hint: true, solution: true, title: true },
  });
  if (!problem) throw new Error("Problem not found");

  const hint =
    problem.hint ??
    (problem.solution?.split(/[.!?]/)[0]?.trim()
      ? `${problem.solution.split(/[.!?]/)[0]!.trim()}.`
      : "Think about the problem constraints and try a brute-force approach first.");

  return { hint };
}

/** Returns the official solution after a failed or partial submission. */
export async function getCodingSolution(userId: string, problemId: string) {
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
    select: { solution: true },
  });
  if (!problem?.solution) throw new Error("No solution available");

  return { solution: problem.solution };
}
