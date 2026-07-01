import { requireUserId } from "@/lib/session";
import { getAnalyticsData } from "@/services/analytics-service";
import { DashboardAnalyticsDynamic } from "@/features/dashboard/dashboard-analytics-dynamic";

/** Server component that loads analytics data and renders charts. */
export async function DashboardAnalyticsSection() {
  const userId = await requireUserId();
  const data = await getAnalyticsData(userId);
  return <DashboardAnalyticsDynamic data={data} />;
}
