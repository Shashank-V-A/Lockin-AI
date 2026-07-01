import { NextResponse } from "next/server";
import { processPendingResumes } from "@/services/resume-worker";
import { logger } from "@/lib/logger";

export const maxDuration = 300;
export const runtime = "nodejs";

async function handleCron(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processPendingResumes(10);
  logger.info("cron.resume_worker", { processed });
  return NextResponse.json({ processed });
}

/** GET — invoked by Vercel Cron. POST — manual or external schedulers. */
export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}
