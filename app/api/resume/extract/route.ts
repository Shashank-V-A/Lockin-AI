import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
    const buffer = Buffer.from(await response.arrayBuffer());

    const pdfParseModule = await import("pdf-parse");
    const pdfParse = "default" in pdfParseModule
      ? (pdfParseModule as { default: (buf: Buffer) => Promise<{ text: string }> }).default
      : (pdfParseModule as unknown as (buf: Buffer) => Promise<{ text: string }>);
    const data = await pdfParse(buffer);

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Failed to extract PDF text" }, { status: 500 });
  }
}
