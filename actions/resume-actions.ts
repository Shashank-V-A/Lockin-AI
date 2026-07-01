"use server";

import { after } from "next/server";
import { requireUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  createResumeRecord,
  getUserResumes,
  getUserResumesPageData,
  getResumeById,
  deleteResume,
  exportUserData,
} from "@/services/resume-service";
import type { ResumeAnalysis } from "@/types/resume";
import { claimAndProcessResume } from "@/services/resume-worker";
import { resumeUploadSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { invalidateDashboardCache } from "@/lib/redis";
import { withActionResult } from "@/lib/action-wrapper";

/** Saves uploaded resume and queues DB-backed processing (polled via /api/resume/status). */
export async function saveAndAnalyzeResume(params: {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  rawText: string;
}) {
  return withActionResult(async () => {
    const userId = await requireUserId();

    await enforceRateLimit(userId, "resume");
    const validated = resumeUploadSchema.parse(params);

    const resume = await createResumeRecord({
      userId,
      fileName: validated.fileName,
      fileUrl: validated.fileUrl,
      fileKey: validated.fileKey,
      rawText: validated.rawText,
    });

    after(async () => {
      try {
        await claimAndProcessResume(resume.id);
      } catch {
        /* logged in worker */
      }
    });

    revalidatePath("/resume");
    return resume.id;
  });
}

/** Polls resume processing status. */
export async function fetchResumeStatus(resumeId: string) {
  const userId = await requireUserId();
  const resume = await getResumeById(userId, resumeId);
  if (!resume) throw new Error("Resume not found");
  return {
    id: resume.id,
    status: resume.status,
    atsScore: resume.atsScore,
    fileName: resume.fileName,
  };
}

/** Gets all resumes for the current user. */
export async function fetchUserResumes() {
  const userId = await requireUserId();
  return getUserResumes(userId);
}

/** Gets resume list and preloads analysis for the latest completed resume. */
export async function fetchResumePageData() {
  const userId = await requireUserId();
  return getUserResumesPageData(userId);
}

/** Gets analysis JSON for a resume (lightweight client fetch). */
export async function fetchResumeAnalysis(resumeId: string) {
  const userId = await requireUserId();
  const record = await getResumeById(userId, resumeId);
  if (!record?.analysis) return null;
  return record.analysis as unknown as ResumeAnalysis;
}

/** Gets a single resume for the current user. */
export async function fetchResume(resumeId: string) {
  const userId = await requireUserId();
  return getResumeById(userId, resumeId);
}

/** Deletes a resume. */
export async function removeResume(resumeId: string) {
  const userId = await requireUserId();

  await deleteResume(userId, resumeId);
  await invalidateDashboardCache(userId);
  revalidatePath("/resume");
  revalidatePath("/dashboard");
}

/** Exports user data as JSON. */
export async function exportAccountData() {
  const userId = await requireUserId();
  return exportUserData(userId);
}
