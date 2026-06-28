import { NextResponse } from "next/server";
import { GOOGLE_REDIRECT_URI } from "@/lib/auth";

/** Returns OAuth setup info so you can verify Google Console config. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  return NextResponse.json({
    app: "Lockin-AI",
    authUrl: process.env.AUTH_URL ?? "http://localhost:3000",
    googleRedirectUri: GOOGLE_REDIRECT_URI,
    googleClientId: process.env.AUTH_GOOGLE_ID ?? "NOT SET",
    instructions: {
      javascriptOrigin: process.env.AUTH_URL ?? "http://localhost:3000",
      redirectUri: GOOGLE_REDIRECT_URI,
      note: "Copy redirectUri EXACTLY into Google Cloud Console → OAuth client → Authorised redirect URIs. It must say /api/ not /apl/",
    },
  });
}
