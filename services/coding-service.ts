import { prisma } from "@/lib/prisma";
import { runCodeTests } from "@/lib/code-runner";
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
