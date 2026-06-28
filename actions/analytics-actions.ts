"use server";

import { auth } from "@/lib/auth";
import { getDashboardStats, getAnalyticsData } from "@/services/analytics-service";

/** Fetches dashboard statistics. */
export async function fetchDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getDashboardStats(session.user.id);
}

/** Fetches analytics chart data. */
export async function fetchAnalyticsData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getAnalyticsData(session.user.id);
}
