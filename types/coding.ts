export interface CodingFeedback {
  betterSolution: string;
  timeComplexity: string;
  spaceComplexity: string;
  mistakes: string[];
  summary: string;
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
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}
