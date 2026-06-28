import { fetchAnalyticsData } from "@/actions/analytics-actions";
import { AnalyticsCharts } from "@/features/analytics/analytics-charts";

export const metadata = { title: "Analytics" };

/** Analytics dashboard page. */
export default async function AnalyticsPage() {
  const data = await fetchAnalyticsData();
  return <AnalyticsCharts data={data} />;
}
