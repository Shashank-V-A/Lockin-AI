import { prisma } from "@/lib/prisma";
import { processResume } from "@/services/resume-service";
import { invalidateDashboardCache } from "@/lib/redis";
import { logger } from "@/lib/logger";

/** Claims and processes a pending resume job (idempotent). */
export async function claimAndProcessResume(resumeId: string): Promise<boolean> {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.status !== "PENDING" || !resume.rawText) {
    return false;
  }

  const claimed = await prisma.resume.updateMany({
    where: { id: resumeId, status: "PENDING" },
    data: { status: "PROCESSING" },
  });

  if (claimed.count === 0) return false;

  try {
    await processResume(resumeId, resume.rawText);
    await invalidateDashboardCache(resume.userId);
    return true;
  } catch (error) {
    logger.error("resume.process_failed", {
      resumeId,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

/** Processes up to N oldest pending resumes (cron/worker). */
export async function processPendingResumes(limit = 5): Promise<number> {
  const pending = await prisma.resume.findMany({
    where: { status: "PENDING", rawText: { not: null } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  let processed = 0;
  for (const { id } of pending) {
    try {
      const ok = await claimAndProcessResume(id);
      if (ok) processed += 1;
    } catch {
      /* logged in claimAndProcessResume */
    }
  }
  return processed;
}
