import { generateJSON, generateText } from "@/lib/groq";
import type { ResumeAnalysis } from "@/types/resume";
import type { AnswerEvaluation, InterviewReport } from "@/types/interview";
import type { CodingFeedback } from "@/types/coding";

const RESUME_SYSTEM = `You are an expert technical recruiter and ATS specialist. Analyze resumes for software engineering roles. Return JSON with: atsScore (0-100), strengths (array), weaknesses (array), missingSkills (array), projectFeedback (array), suggestions (array), summary (string). Be specific and actionable.`;

const INTERVIEW_QUESTIONS_SYSTEM = `You are a senior engineering interviewer. Generate interview questions as JSON with a "questions" array. Each item has: question (string), category (string - one of: Technical, Behavioral, System Design, Coding, Culture).`;

const ANSWER_EVAL_SYSTEM = `You are an interview evaluator. Score answers 0-100 on technicalAccuracy, communication, confidence, completeness. Return JSON with those fields plus overallScore (average) and feedback (string). Be constructive.`;

const INTERVIEW_REPORT_SYSTEM = `You are an interview coach. Generate a comprehensive interview report as JSON with: overallScore, summary, strengths, improvements, categoryBreakdown (array of {category, score}), recommendations.`;

const CODING_FEEDBACK_SYSTEM = `You are a senior software engineer. Review code submissions. Return JSON with: betterSolution, timeComplexity, spaceComplexity, mistakes (array), summary.`;

/** Analyzes resume text and returns structured feedback. */
export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  return generateJSON<ResumeAnalysis>(
    RESUME_SYSTEM,
    `Analyze this resume:\n\n${text.slice(0, 12000)}`,
  );
}

/** Generates mock interview questions for a session. */
export async function generateInterviewQuestions(params: {
  company: string;
  role: string;
  experience: string;
  difficulty: string;
  count?: number;
}): Promise<{ question: string; category: string }[]> {
  const result = await generateJSON<{ questions: { question: string; category: string }[] }>(
    INTERVIEW_QUESTIONS_SYSTEM,
    `Company: ${params.company}\nRole: ${params.role}\nExperience: ${params.experience}\nDifficulty: ${params.difficulty}\nGenerate ${params.count ?? 9} questions.`,
  );
  return result.questions;
}

/** Evaluates a single interview answer. */
export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  company: string;
  role: string;
}): Promise<AnswerEvaluation> {
  return generateJSON<AnswerEvaluation>(
    ANSWER_EVAL_SYSTEM,
    `Company: ${params.company}\nRole: ${params.role}\nQuestion: ${params.question}\nAnswer: ${params.answer}`,
  );
}

/** Generates a final interview session report. */
export async function generateInterviewReport(params: {
  company: string;
  role: string;
  qaPairs: { question: string; answer: string; scores: AnswerEvaluation }[];
}): Promise<InterviewReport> {
  return generateJSON<InterviewReport>(
    INTERVIEW_REPORT_SYSTEM,
    JSON.stringify(params),
  );
}

/** Provides AI feedback on a coding submission. */
export async function analyzeCodingSubmission(params: {
  problem: string;
  code: string;
  language: string;
  passed: boolean;
}): Promise<CodingFeedback> {
  return generateJSON<CodingFeedback>(
    CODING_FEEDBACK_SYSTEM,
    `Problem: ${params.problem}\nLanguage: ${params.language}\nPassed: ${params.passed}\nCode:\n${params.code}`,
  );
}

/** Generates a coach chat response with conversation history. */
export async function generateCoachResponse(
  messages: { role: string; content: string }[],
): Promise<string> {
  const systemPrompt = `You are Lockin-AI Coach — a knowledgeable, concise career coach for software engineers. Help with interview prep, resume advice, and career guidance. Be practical and encouraging.`;

  const history = messages
    .slice(-10)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  return generateText(systemPrompt, history);
}
