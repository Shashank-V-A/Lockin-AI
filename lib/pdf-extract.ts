import { extractText, getDocumentProxy } from "unpdf";

/** Extracts plain text from a PDF buffer (serverless-safe, no native canvas deps). */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim();
}

/** Resolves the public file URL from an UploadThing upload result. */
export function getUploadFileUrl(file: { url?: string; ufsUrl?: string }): string {
  return file.ufsUrl ?? file.url ?? "";
}
