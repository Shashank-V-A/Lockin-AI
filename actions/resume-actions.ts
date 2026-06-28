"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createResumeRecord,
  processResume,
  getUserResumes,
  getResumeById,
} from "@/services/resume-service";

/** Saves uploaded resume and triggers analysis. */
export async function saveAndAnalyzeResume(params: {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  rawText: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const resume = await createResumeRecord({
    userId: session.user.id,
    ...params,
  });

  await processResume(resume.id, params.rawText);
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
