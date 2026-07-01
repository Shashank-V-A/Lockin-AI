import { Suspense } from "react";
import { DashboardContent } from "@/features/dashboard/dashboard-content";
import { DashboardAnalyticsSection } from "@/features/dashboard/dashboard-analytics-section";
import { DashboardStatsSection } from "@/features/dashboard/dashboard-stats-section";
import { DashboardStatsSkeleton } from "@/features/dashboard/dashboard-stats-skeleton";
import { ChartsSkeleton } from "@/components/ui/charts-skeleton";

export const metadata = { title: "Dashboard" };

/** Dashboard overview with streaming stats and analytics. */
export default function DashboardPage() {
  return (
    <DashboardContent
      stats={
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStatsSection />
        </Suspense>
      }
      analytics={
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardAnalyticsSection />
        </Suspense>
      }
    />
  );
}
