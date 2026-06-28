import { fetchDashboardPageData } from "@/actions/analytics-actions";
import { DashboardContent } from "@/features/dashboard/dashboard-content";

export const metadata = { title: "Dashboard" };

/** Dashboard overview with stats and analytics. */
export default async function DashboardPage() {
  const data = await fetchDashboardPageData();
  return <DashboardContent data={data} />;
}
