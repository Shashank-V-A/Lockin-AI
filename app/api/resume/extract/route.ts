import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractPdfText } from "@/lib/pdf-extract";

/** Extracts text content from an uploaded PDF resume. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fileUrl } = await request.json();
    if (!fileUrl) {
      return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch uploaded file" }, { status: 502 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const text = await extractPdfText(buffer);

    if (!text) {
      return NextResponse.json({ error: "No text found in PDF" }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to extract PDF text" }, { status: 500 });
  }
}
