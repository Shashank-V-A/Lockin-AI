"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
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

/** Saves uploaded resume and triggers analysis. */
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

  await processResume(resume.id, validated.rawText);
  revalidatePath("/resume");
  revalidatePath("/dashboard");

  return resume.id;
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
