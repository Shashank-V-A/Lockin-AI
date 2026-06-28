import { PDFParse } from "pdf-parse";

/** Extracts plain text from a PDF buffer using pdf-parse v2. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

/** Resolves the public file URL from an UploadThing upload result. */
export function getUploadFileUrl(file: { url?: string; ufsUrl?: string }): string {
  return file.ufsUrl ?? file.url ?? "";
}
