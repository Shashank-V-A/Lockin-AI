/** Hosts UploadThing uses to serve uploaded files (CDN + legacy). */
const ALLOWED_UPLOAD_HOST_SUFFIXES = [
  "ufs.sh",
  "utfs.io",
  "uploadthing.com",
  "uploadthing-prod.s3.us-west-2.amazonaws.com",
];

function isAllowedUploadHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return ALLOWED_UPLOAD_HOST_SUFFIXES.some(
    (suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`),
  );
}

/** Validates that a URL is safe to fetch server-side (SSRF protection). */
export function assertSafeFileUrl(fileUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    throw new Error("Invalid file URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS file URLs are allowed");
  }

  const host = parsed.hostname.toLowerCase();

  if (!isAllowedUploadHost(host)) {
    throw new Error("File URL must be from an allowed upload host");
  }

  const blocked =
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\./.test(parsed.hostname) ||
    /^10\./.test(parsed.hostname) ||
    /^192\.168\./.test(parsed.hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname);

  if (blocked) {
    throw new Error("Private network URLs are not allowed");
  }
}
