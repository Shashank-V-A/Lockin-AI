import type { TestResult } from "@/lib/code-runner";

export interface CodingFeedback {
  betterSolution: string;
  timeComplexity: string;
  spaceComplexity: string;
  mistakes: string[];
  summary: string;
  testResults?: TestResult[];
  compileError?: string;
}

export interface CodingProblemData {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  topic: string;
  starterCode: Record<string, string>;
  timeLimit: number;
}

export interface CodingSubmissionResult {
  status: string;
  runtime: number;
  memory: number;
  passedTests: number;
  totalTests: number;
  score: number;
  feedback: CodingFeedback;
  testResults: TestResult[];
  compileError?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}
