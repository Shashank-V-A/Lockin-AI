import { z } from "zod";

export const resumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingSkills: z.array(z.string()),
  projectFeedback: z.array(z.string()),
  suggestions: z.array(z.string()),
  summary: z.string(),
});

export const answerEvaluationSchema = z.object({
  technicalAccuracy: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  feedback: z.string(),
});

export const interviewReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  categoryBreakdown: z.array(
    z.object({ category: z.string(), score: z.number().min(0).max(100) }),
  ),
  recommendations: z.array(z.string()),
});

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => v ?? "");

const nullableStringArray = z
  .union([z.array(z.string()), z.null(), z.undefined()])
  .transform((v) => v ?? []);

export const codingFeedbackSchema = z.object({
  betterSolution: nullableString,
  timeComplexity: nullableString,
  spaceComplexity: nullableString,
  mistakes: nullableStringArray,
  summary: nullableString,
});

export const interviewQuestionsSchema = z.object({
  questions: z.array(
    z.object({ question: z.string(), category: z.string() }),
  ),
});
