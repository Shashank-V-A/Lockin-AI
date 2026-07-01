"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

/** Hydrates client session from the server to avoid an extra /api/auth/session fetch. */
export function AuthSessionProvider({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      {children}
    </SessionProvider>
  );
}
