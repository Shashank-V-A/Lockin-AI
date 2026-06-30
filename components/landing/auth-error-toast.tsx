"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  Configuration: "Sign-in is misconfigured. Check Google OAuth credentials in .env.",
  AccessDenied: "Access denied.",
  Verification: "Sign-in link expired. Please try again.",
  OAuthSignin: "Could not start Google sign-in. Try again.",
  OAuthCallback: "Google sign-in callback failed. Verify the redirect URI in Google Cloud Console.",
  OAuthAccountNotLinked: "This email is linked to another sign-in method.",
  Default: "Sign-in failed. Please try again.",
};

/** Shows a toast when Auth.js redirects home with ?error=. */
export function AuthErrorToast() {
  const params = useSearchParams();

  useEffect(() => {
    const error = params.get("error");
    if (!error) return;
    toast.error(MESSAGES[error] ?? MESSAGES.Default);
  }, [params]);

  return null;
}
