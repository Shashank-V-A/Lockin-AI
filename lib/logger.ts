type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  requestId?: string;
  userId?: string;
  action?: string;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  const entry = {
    level,
    message,
    ts: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "development",
    ...meta,
  };

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, meta?: LogMeta) => emit("info", message, meta),
  warn: (message: string, meta?: LogMeta) => emit("warn", message, meta),
  error: (message: string, meta?: LogMeta) => emit("error", message, meta),
  debug: (message: string, meta?: LogMeta) => emit("debug", message, meta),
};

/** Tracks AI usage for cost observability. */
export function logAiUsage(params: {
  feature: string;
  userId?: string;
  requestId?: string;
  model?: string;
}) {
  logger.info("ai.usage", params);
}
