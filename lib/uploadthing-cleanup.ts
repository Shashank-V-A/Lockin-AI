import { UTApi } from "uploadthing/server";
import { logger } from "@/lib/logger";

let utapi: UTApi | null = null;

function getUtApi(): UTApi | null {
  if (!process.env.UPLOADTHING_TOKEN) return null;
  if (!utapi) utapi = new UTApi();
  return utapi;
}

/** Deletes files from UploadThing storage (best-effort). */
export async function deleteUploadFiles(fileKeys: string[]): Promise<void> {
  const api = getUtApi();
  if (!api || fileKeys.length === 0) return;

  try {
    await api.deleteFiles(fileKeys);
  } catch (error) {
    logger.warn("uploadthing.delete_failed", {
      error: error instanceof Error ? error.message : "unknown",
      count: fileKeys.length,
    });
  }
}
