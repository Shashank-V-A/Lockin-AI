import { auth } from "@/lib/auth";
import { getAnalyticsData } from "@/services/analytics-service";
import { DashboardAnalyticsDynamic } from "@/features/dashboard/dashboard-analytics-dynamic";

/** Server component that loads analytics data and renders charts. */
export async function DashboardAnalyticsSection() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getAnalyticsData(session.user.id);
  return <DashboardAnalyticsDynamic data={data} />;
}
