"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  createResumeRecord,
  processResume,
  getUserResumes,
  getResumeById,
  deleteResume,
  exportUserData,
} from "@/services/resume-service";
import { resumeUploadSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";

/** Saves uploaded resume and queues async AI analysis. */
export async function saveAndAnalyzeResume(params: {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  rawText: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await enforceRateLimit(session.user.id, "resume");
  const validated = resumeUploadSchema.parse(params);

  const resume = await createResumeRecord({
    userId: session.user.id,
    fileName: validated.fileName,
    fileUrl: validated.fileUrl,
    fileKey: validated.fileKey,
  });

  after(async () => {
    try {
      await processResume(resume.id, validated.rawText);
      revalidatePath("/resume");
      revalidatePath("/dashboard");
    } catch {
      revalidatePath("/resume");
    }
  });

  revalidatePath("/resume");
  return resume.id;
}

/** Polls resume processing status. */
export async function fetchResumeStatus(resumeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const resume = await getResumeById(session.user.id, resumeId);
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getUserResumes(session.user.id);
}

/** Gets a single resume for the current user. */
export async function fetchResume(resumeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getResumeById(session.user.id, resumeId);
}

/** Deletes a resume. */
export async function removeResume(resumeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await deleteResume(session.user.id, resumeId);
  revalidatePath("/resume");
  revalidatePath("/dashboard");
}

/** Exports user data as JSON. */
export async function exportAccountData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return exportUserData(session.user.id);
}
