import { z } from "zod";

export const coachMessageSchema = z.string().trim().min(1).max(4000);

export const interviewAnswerSchema = z.string().trim().min(1).max(8000);

export const codeSubmissionSchema = z.string().max(50000);

export const resumeTextSchema = z.string().max(50000);

export const startInterviewSchema = z.object({
  company: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(100),
  experience: z.string().trim().min(1).max(50),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

export const resumeUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().url().max(2048),
  fileKey: z.string().min(1).max(512),
  rawText: resumeTextSchema,
});

export const resumeExtractSchema = z.object({
  fileUrl: z.string().url().max(2048),
});
