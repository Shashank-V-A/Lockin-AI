export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "RATE_LIMIT"
  | "VALIDATION"
  | "NOT_FOUND"
  | "INTERNAL";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ActionErrorCode };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionFail(
  error: string,
  code: ActionErrorCode = "INTERNAL",
): ActionResult<never> {
  return { ok: false, error, code };
}

/** Maps thrown errors to ActionResult for server actions. */
export function toActionResult(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    if (error.name === "RateLimitError") {
      return actionFail(error.message, "RATE_LIMIT");
    }
    if (error.message === "Unauthorized") {
      return actionFail("Unauthorized", "UNAUTHORIZED");
    }
    if (error.message.includes("not found")) {
      return actionFail(error.message, "NOT_FOUND");
    }
    return actionFail(error.message, "INTERNAL");
  }
  return actionFail("Something went wrong", "INTERNAL");
}
