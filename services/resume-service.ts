import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/services/ai-service";
import type { ResumeAnalysis } from "@/types/resume";

/** Creates a resume record after upload. */
export async function createResumeRecord(params: {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
}) {
  return prisma.resume.create({
    data: {
      userId: params.userId,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      fileKey: params.fileKey,
      status: "PENDING",
    },
  });
}

/** Processes resume text with AI analysis. */
export async function processResume(resumeId: string, rawText: string) {
  await prisma.resume.update({
    where: { id: resumeId },
    data: { status: "PROCESSING", rawText },
  });

  try {
    const analysis = await analyzeResume(rawText);

    const resume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        status: "COMPLETED",
        atsScore: analysis.atsScore,
        analysis: analysis as object,
      },
    });

    await prisma.report.create({
      data: {
        userId: resume.userId,
        type: "RESUME",
        title: `Resume Analysis - ${resume.fileName}`,
        data: analysis as object,
        resumeId: resume.id,
      },
    });

    return analysis;
  } catch {
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "FAILED" },
    });
    throw new Error("Failed to analyze resume");
  }
}

/** Gets all resumes for a user. */
export async function getUserResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/** Gets a single resume by ID. */
export async function getResumeById(userId: string, resumeId: string) {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
}

/** Gets latest resume score for dashboard. */
export async function getLatestResumeScore(userId: string): Promise<number> {
  const resume = await prisma.resume.findFirst({
    where: { userId, status: "COMPLETED", atsScore: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  return resume?.atsScore ?? 0;
}

export type { ResumeAnalysis };
