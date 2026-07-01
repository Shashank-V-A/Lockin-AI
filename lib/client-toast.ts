"use client";

import type { ActionResult } from "@/lib/action-result";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Please sign in to continue.",
  RATE_LIMIT: "Too many requests — please wait and try again.",
  VALIDATION: "Invalid input. Check your data and try again.",
  NOT_FOUND: "The requested item was not found.",
  SESSION_INACTIVE: "This interview is no longer active. Start a new session.",
  INTERNAL: "Something went wrong. Please try again.",
};

/** Shows a toast for failed ActionResult responses. Returns true if failed. */
export function toastActionError<T>(
  result: ActionResult<T>,
): result is Extract<ActionResult<T>, { ok: false }> {
  if (result.ok) return false;
  toast.error(result.error || MESSAGES[result.code] || MESSAGES.INTERNAL);
  return true;
}
