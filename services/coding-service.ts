import { prisma } from "@/lib/prisma";
import { analyzeCodingSubmission } from "@/services/ai-service";
import type { CodingFeedback, TestCase } from "@/types/coding";

/** Gets all coding problems. */
export async function getCodingProblems() {
  return prisma.codingProblem.findMany({
    orderBy: [{ difficulty: "asc" }, { title: "asc" }],
  });
}

/** Gets a coding problem by slug. */
export async function getCodingProblem(slug: string) {
  return prisma.codingProblem.findUnique({ where: { slug } });
}

/** Simulates code execution for MVP (no external judge). */
export function simulateExecution(
  code: string,
  testCases: TestCase[],
): { passedTests: number; totalTests: number; runtime: number; memory: number } {
  const totalTests = testCases.length;
  const codeLower = code.toLowerCase();
  const hasLogic =
    codeLower.includes("return") ||
    codeLower.includes("print") ||
    code.length > 50;
  const passedTests = hasLogic
    ? Math.max(1, Math.floor(totalTests * (0.4 + Math.random() * 0.5)))
    : 0;

  return {
    passedTests,
    totalTests,
    runtime: Math.floor(20 + Math.random() * 180),
    memory: Math.floor(1024 + Math.random() * 8192),
  };
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
  const result = simulateExecution(params.code, testCases);
  const passed = result.passedTests === result.totalTests;
  const score = Math.round((result.passedTests / result.totalTests) * 100);

  const feedback = await analyzeCodingSubmission({
    problem: problem.description,
    code: params.code,
    language: params.language,
    passed,
  });

  const submission = await prisma.codingSubmission.create({
    data: {
      userId: params.userId,
      problemId: params.problemId,
      language: params.language,
      code: params.code,
      status: passed ? "PASSED" : result.passedTests > 0 ? "FAILED" : "ERROR",
      runtime: result.runtime,
      memory: result.memory,
      score,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      aiFeedback: feedback as object,
    },
    include: { problem: true },
  });

  return { submission, feedback: feedback as CodingFeedback };
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
