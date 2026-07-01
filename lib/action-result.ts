export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "RATE_LIMIT"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SESSION_INACTIVE"
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

function isInternalError(error: Error): boolean {
  return (
    error.name.startsWith("Prisma") ||
    error.message.includes("Invalid `prisma.") ||
    error.message.includes("invocation")
  );
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
    if (error.message === "Interview session is not active") {
      return actionFail(
        "This interview is no longer active. Start a new session from Mock Interview.",
        "SESSION_INACTIVE",
      );
    }
    if (error.message === "Question already answered") {
      return actionFail(
        "This question was already submitted. Refreshing your progress…",
        "VALIDATION",
      );
    }
    if (isInternalError(error)) {
      return actionFail("Something went wrong. Please refresh and try again.", "INTERNAL");
    }
    return actionFail(error.message, "INTERNAL");
  }
  return actionFail("Something went wrong", "INTERNAL");
}
