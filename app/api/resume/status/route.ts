import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResumeById } from "@/services/resume-service";
import { claimAndProcessResume } from "@/services/resume-worker";

/** GET /api/resume/status?id= — poll status; kicks DB-backed processing when pending. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let resume = await getResumeById(session.user.id, id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (resume.status === "PENDING" && resume.rawText) {
    try {
      await claimAndProcessResume(id);
    } catch {
      /* status updated on refresh */
    }
    resume = (await getResumeById(session.user.id, id)) ?? resume;
  }

  return NextResponse.json({
    id: resume.id,
    status: resume.status,
    atsScore: resume.atsScore,
    fileName: resume.fileName,
  });
}
