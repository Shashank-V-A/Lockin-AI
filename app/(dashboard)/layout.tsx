import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import DashboardGroupLoading from "./loading";

/** Protected dashboard layout wrapper. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <DashboardShell>
      <Suspense fallback={<DashboardGroupLoading />}>{children}</Suspense>
    </DashboardShell>
  );
}
