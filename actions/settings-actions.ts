"use server";

import { auth } from "@/lib/auth";
import { exportUserData } from "@/services/resume-service";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";

/** Exports all user data as downloadable JSON string. */
export async function downloadUserData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const data = await exportUserData(session.user.id);
  return JSON.stringify(data, null, 2);
}

/** Permanently deletes the user account. */
export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirect: false });
}
