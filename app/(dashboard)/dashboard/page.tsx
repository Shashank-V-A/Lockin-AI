import { fetchDashboardStats } from "@/actions/analytics-actions";
import { DashboardContent } from "@/features/dashboard/dashboard-content";

export const metadata = { title: "Dashboard" };

/** Dashboard overview page. */
export default async function DashboardPage() {
  const stats = await fetchDashboardStats();
  return <DashboardContent stats={stats} />;
}
