import { cache } from "react";
import { auth } from "@/lib/auth";

/** Deduplicated session lookup within a single request. */
export const getSession = cache(auth);

/** Returns the authenticated user id or throws. */
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}
