import { Suspense } from "react";
import { fetchDashboardStats } from "@/actions/analytics-actions";
import { DashboardContent } from "@/features/dashboard/dashboard-content";
import { DashboardAnalyticsSection } from "@/features/dashboard/dashboard-analytics-section";
import { ChartsSkeleton } from "@/components/ui/charts-skeleton";

export const metadata = { title: "Dashboard" };

/** Dashboard overview with stats and analytics. */
export default async function DashboardPage() {
  const stats = await fetchDashboardStats();

  return (
    <DashboardContent
      stats={stats}
      analytics={
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardAnalyticsSection />
        </Suspense>
      }
    />
  );
}
