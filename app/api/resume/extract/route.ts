import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractPdfText } from "@/lib/pdf-extract";
import { assertSafeFileUrl } from "@/lib/url-security";
import { resumeExtractSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";

/** Extracts text content from an uploaded PDF resume. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit(session.user.id, "resume");

    const body = resumeExtractSchema.parse(await request.json());
    assertSafeFileUrl(body.fileUrl);

    const response = await fetch(body.fileUrl, { redirect: "error" });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch uploaded file" }, { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const text = await extractPdfText(buffer);

    if (!text) {
      return NextResponse.json({ error: "No text found in PDF" }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    if (error instanceof Error && error.name === "RateLimitError") {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to extract PDF text" }, { status: 500 });
  }
}
