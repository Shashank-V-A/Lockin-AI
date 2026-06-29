"use server";

import { auth } from "@/lib/auth";
import { exportUserData } from "@/services/resume-service";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";
import { deleteUploadFiles } from "@/lib/uploadthing-cleanup";
import { invalidateDashboardCache } from "@/lib/redis";

/** Exports all user data as downloadable JSON string. */
export async function downloadUserData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const data = await exportUserData(session.user.id);
  return JSON.stringify(data, null, 2);
}

/** Permanently deletes the user account and UploadThing files. */
export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: { fileKey: true },
  });

  await deleteUploadFiles(resumes.map((r) => r.fileKey));
  await invalidateDashboardCache(userId);
  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirect: false });
}
