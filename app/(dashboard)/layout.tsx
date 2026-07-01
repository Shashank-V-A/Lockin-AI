import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AuthSessionProvider } from "@/components/auth-session-provider";
import DashboardGroupLoading from "./loading";

/** Protected dashboard layout wrapper. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/");

  return (
    <AuthSessionProvider session={session}>
      <DashboardShell>
        <Suspense fallback={<DashboardGroupLoading />}>{children}</Suspense>
      </DashboardShell>
    </AuthSessionProvider>
  );
}
