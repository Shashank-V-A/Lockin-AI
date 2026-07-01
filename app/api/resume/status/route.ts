import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getResumeById } from "@/services/resume-service";
import { claimAndProcessResume } from "@/services/resume-worker";

/** GET /api/resume/status?id= — poll status; kicks processing in the background when pending. */
export async function GET(request: Request) {
  const userId = await requireUserId().catch(() => null);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const resume = await getResumeById(userId, id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (resume.status === "PENDING") {
    void claimAndProcessResume(id).catch(() => {
      /* logged in worker */
    });
  }

  return NextResponse.json({
    id: resume.id,
    status: resume.status,
    atsScore: resume.atsScore,
    fileName: resume.fileName,
  });
}
