"use server";

import { auth } from "@/lib/auth";
import { getDashboardPageData } from "@/services/analytics-service";

/** Fetches combined dashboard stats and analytics. */
export async function fetchDashboardPageData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return getDashboardPageData(session.user.id);
}

/** Fetches analytics subset for PDF report generation. */
export async function fetchResumeReportAnalytics() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { stats, analytics } = await getDashboardPageData(session.user.id);

  return {
    readinessScore: stats.readinessScore,
    resumeScore: stats.resumeScore,
    interviewAvg: stats.interviewAvg,
    codingAvg: stats.codingAvg,
    resumeHistory: analytics.resumeScores,
    recentPerformance: analytics.recentPerformance,
    strongAreas: analytics.strongAreas,
    weakAreas: analytics.weakAreas,
  };
}
