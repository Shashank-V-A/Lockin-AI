import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/services/ai-service";
import { deleteUploadFiles } from "@/lib/uploadthing-cleanup";
import type { ResumeAnalysis } from "@/types/resume";

/** Creates a resume record after upload. */
export async function createResumeRecord(params: {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  rawText?: string;
}) {
  return prisma.resume.create({
    data: {
      userId: params.userId,
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      fileKey: params.fileKey,
      rawText: params.rawText,
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

/** Gets resume list summaries (excludes heavy rawText/analysis payloads). */
export async function getUserResumeSummaries(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      atsScore: true,
      status: true,
      createdAt: true,
    },
  });
}

/** Gets resume list plus analysis for the most recent completed resume (page load). */
export async function getUserResumesPageData(userId: string) {
  const resumes = await getUserResumeSummaries(userId);
  const latestCompleted = resumes.find((r) => r.status === "COMPLETED");

  let initialAnalysis: ResumeAnalysis | null = null;
  if (latestCompleted) {
    const record = await prisma.resume.findFirst({
      where: { id: latestCompleted.id, userId },
      select: { analysis: true },
    });
    initialAnalysis = (record?.analysis as ResumeAnalysis | null) ?? null;
  }

  return {
    resumes,
    initialAnalysisId: latestCompleted?.id ?? null,
    initialAnalysis,
  };
}

/** Gets a single resume by ID. */
export async function getResumeById(userId: string, resumeId: string) {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      atsScore: true,
      analysis: true,
      status: true,
      createdAt: true,
    },
  });
}

/** Gets latest completed resume for a user. */
export async function getLatestResumeForUser(userId: string) {
  return prisma.resume.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  });
}

/** Deletes a resume and its UploadThing file. */
export async function deleteResume(userId: string, resumeId: string) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
  if (!resume) throw new Error("Resume not found");

  await deleteUploadFiles([resume.fileKey]);
  await prisma.resume.delete({ where: { id: resumeId } });
}

/** Exports user data for GDPR-style download. */
export async function exportUserData(userId: string) {
  const [user, resumes, interviews, submissions, coachMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.resume.findMany({
      where: { userId },
      select: { fileName: true, atsScore: true, status: true, createdAt: true, analysis: true },
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      select: { company: true, role: true, overallScore: true, status: true, createdAt: true },
    }),
    prisma.codingSubmission.findMany({
      where: { userId },
      select: { language: true, score: true, status: true, createdAt: true },
      take: 100,
    }),
    prisma.coachMessage.findMany({
      where: { userId },
      select: { role: true, content: true, createdAt: true },
      take: 200,
    }),
  ]);

  return { user, resumes, interviews, submissions, coachMessages };
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
