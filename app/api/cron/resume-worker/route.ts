import { NextResponse } from "next/server";
import { processPendingResumes } from "@/services/resume-worker";
import { logger } from "@/lib/logger";

/** POST /api/cron/resume-worker — processes pending resume jobs. */
export async function POST(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processPendingResumes(10);
  logger.info("cron.resume_worker", { processed });
  return NextResponse.json({ processed });
}
