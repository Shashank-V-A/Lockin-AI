import type { ActionResult } from "@/lib/action-result";
import { actionOk, toActionResult } from "@/lib/action-result";

/** Wraps a server action in ActionResult for consistent client error handling. */
export async function withActionResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return actionOk(await fn());
  } catch (error) {
    return toActionResult(error);
  }
}
