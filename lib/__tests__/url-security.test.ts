import { describe, it, expect } from "vitest";
import { assertSafeFileUrl } from "@/lib/url-security";

describe("url-security", () => {
  it("allows UploadThing ufs.sh CDN URLs", () => {
    expect(() =>
      assertSafeFileUrl("https://rx6wge0017.ufs.sh/f/Uxc7lSJLXaiJswJPSVsg0QYDSuzNdcJOIBT7V2akfEqCZiyX"),
    ).not.toThrow();
  });

  it("allows legacy utfs.io URLs", () => {
    expect(() =>
      assertSafeFileUrl("https://utfs.io/f/abc123"),
    ).not.toThrow();
  });

  it("rejects arbitrary hosts", () => {
    expect(() => assertSafeFileUrl("https://evil.example.com/resume.pdf")).toThrow(
      "File URL must be from an allowed upload host",
    );
  });
});
