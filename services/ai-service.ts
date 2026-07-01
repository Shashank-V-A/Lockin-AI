import { generateJSON } from "@/lib/groq";
import {
  resumeAnalysisSchema,
  answerEvaluationSchema,
  interviewReportSchema,
  codingFeedbackSchema,
  interviewQuestionsSchema,
  followUpQuestionSchema,
} from "@/lib/ai-schemas";
import { prisma } from "@/lib/prisma";
import type { ResumeAnalysis } from "@/types/resume";
import type { AnswerEvaluation, InterviewReport } from "@/types/interview";
import type { CodingFeedback } from "@/types/coding";

const RESUME_SYSTEM = `You are an expert technical recruiter and ATS specialist. Analyze resumes for software engineering roles. Return JSON with: atsScore (0-100), strengths (array), weaknesses (array), missingSkills (array), projectFeedback (array), suggestions (array), summary (string). Be specific and actionable.`;

const INTERVIEW_QUESTIONS_SYSTEM = `You are a senior engineering interviewer. Generate interview questions as JSON with a "questions" array. Each item has: question (string), category (string - one of: Technical, Behavioral, System Design, Coding, Culture). Tailor questions to the candidate resume when provided.`;

const ANSWER_EVAL_SYSTEM = `You are an interview evaluator. Score answers 0-100 on technicalAccuracy, communication, confidence, completeness. Return JSON with those fields plus overallScore (average) and feedback (string). Be constructive.`;

const FOLLOW_UP_SYSTEM = `You are a senior interviewer conducting a mock interview. Based on the candidate's answer, ask ONE concise follow-up question that probes deeper — clarify assumptions, edge cases, trade-offs, or real-world application. Return JSON with a single "question" field. Do not repeat the original question.`;

const INTERVIEW_REPORT_SYSTEM = `You are an interview coach. Generate a comprehensive interview report as JSON with: overallScore, summary, strengths, improvements, categoryBreakdown (array of {category, score}), recommendations.`;

const CODING_FEEDBACK_SYSTEM = `You are a senior software engineer. Review code submissions. Return JSON with: betterSolution (string, use "" if already optimal), timeComplexity, spaceComplexity, mistakes (array of strings), summary. Never use null — use empty string or empty array instead.`;

const COACH_SYSTEM_BASE = `You are Lockin-AI Coach — an expert software engineering interview and career coach.

Format every response in clean, readable Markdown (like ChatGPT):
- Use ## for main sections and ### for subsections
- Use bullet lists and numbered steps where helpful
- Put ALL code in fenced blocks with the correct language tag
- For coding questions include: Problem summary, Approach, Solution, Time/Space complexity, Edge cases
- For behavioral questions use STAR format
- For system design, use clear sections: Requirements, High-level design, Components, Trade-offs
- Be practical, accurate, and encouraging`;

/** Builds personalized coach system prompt with user context. */
export async function buildCoachSystemPrompt(userId: string): Promise<string> {
  const [latestResume, recentInterview] = await Promise.all([
    prisma.resume.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      select: { atsScore: true, analysis: true },
    }),
    prisma.interviewSession.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      select: { company: true, role: true, overallScore: true },
    }),
  ]);

  const parts = [COACH_SYSTEM_BASE];

  if (latestResume?.atsScore != null) {
    parts.push(`\nUser resume ATS score: ${latestResume.atsScore}/100.`);
    const analysis = latestResume.analysis as ResumeAnalysis | null;
    if (analysis?.missingSkills?.length) {
      parts.push(`Missing skills: ${analysis.missingSkills.slice(0, 8).join(", ")}.`);
    }
  }

  if (recentInterview) {
    parts.push(
      `\nLatest mock interview: ${recentInterview.company} (${recentInterview.role}) — score ${recentInterview.overallScore}%.`,
    );
  }

  const weakSubs = await prisma.codingSubmission.findMany({
    where: { userId, score: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { score: true, problem: { select: { topic: true } } },
  });

  if (weakSubs.length > 0) {
    const byTopic: Record<string, number[]> = {};
    for (const s of weakSubs) {
      const t = s.problem.topic;
      if (!byTopic[t]) byTopic[t] = [];
      byTopic[t].push(s.score!);
    }
    const weak = Object.entries(byTopic)
      .map(([area, scores]) => ({
        area,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
      .map((w) => w.area);

    if (weak.length) {
      parts.push(`\nWeak coding areas: ${weak.join(", ")}.`);
    }
  }

  return parts.join("");
}

/** Analyzes resume text and returns structured feedback. */
export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  return generateJSON<ResumeAnalysis>(
    RESUME_SYSTEM,
    `Analyze this resume:\n\n${text.slice(0, 12000)}`,
    resumeAnalysisSchema,
  );
}

/** Generates mock interview questions for a session. */
export async function generateInterviewQuestions(params: {
  company: string;
  role: string;
  experience: string;
  difficulty: string;
  count?: number;
  resumeContext?: string;
}): Promise<{ question: string; category: string }[]> {
  const resumeNote = params.resumeContext
    ? `\nCandidate resume excerpt:\n${params.resumeContext}`
    : "";

  const result = await generateJSON(
    INTERVIEW_QUESTIONS_SYSTEM,
    `Company: ${params.company}\nRole: ${params.role}\nExperience: ${params.experience}\nDifficulty: ${params.difficulty}\nGenerate ${params.count ?? 9} questions.${resumeNote}`,
    interviewQuestionsSchema,
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
    answerEvaluationSchema,
  );
}

/** Generates a follow-up question based on the candidate's answer. */
export async function generateFollowUpQuestion(params: {
  question: string;
  answer: string;
  company: string;
  role: string;
}): Promise<string> {
  const result = await generateJSON(
    FOLLOW_UP_SYSTEM,
    `Company: ${params.company}\nRole: ${params.role}\nOriginal question: ${params.question}\nCandidate answer: ${params.answer}`,
    followUpQuestionSchema,
  );
  return result.question;
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
    interviewReportSchema,
  );
}

/** Provides AI feedback on a coding submission. */
export async function analyzeCodingSubmission(params: {
  problem: string;
  code: string;
  language: string;
  passed: boolean;
  testResults?: { input: string; expected: string; actual?: string; error?: string; passed: boolean }[];
}): Promise<CodingFeedback> {
  const testSummary = params.testResults
    ? `\nTest results:\n${JSON.stringify(params.testResults, null, 2)}`
    : "";

  return generateJSON<CodingFeedback>(
    CODING_FEEDBACK_SYSTEM,
    `Problem: ${params.problem}\nLanguage: ${params.language}\nAll tests passed: ${params.passed}${testSummary}\nCode:\n${params.code}`,
    codingFeedbackSchema,
  );
}
