/** True in production builds (Vercel, Docker prod, etc.). */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Whether local execFile code execution is allowed. */
export function allowLocalCodeExecution(): boolean {
  if (process.env.DISABLE_LOCAL_CODE_EXEC === "true") return false;
  if (isProduction()) return false;
  if (process.env.CODE_RUNNER === "piston" || process.env.CODE_RUNNER === "judge0") {
    return false;
  }
  return true;
}
