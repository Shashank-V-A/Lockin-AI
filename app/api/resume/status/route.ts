import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResumeById } from "@/services/resume-service";

/** GET /api/resume/status?id= — poll async resume processing. */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const resume = await getResumeById(session.user.id, id);
  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: resume.id,
    status: resume.status,
    atsScore: resume.atsScore,
    fileName: resume.fileName,
  });
}
