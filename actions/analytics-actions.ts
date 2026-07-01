"use server";

import { requireUserId } from "@/lib/session";
import { getDashboardPageData, getDashboardStats } from "@/services/analytics-service";

/** Fetches dashboard stats only (fast path for initial paint). */
export async function fetchDashboardStats() {
  const userId = await requireUserId();
  return getDashboardStats(userId);
}

/** Fetches combined dashboard stats and analytics. */
export async function fetchDashboardPageData() {
  const userId = await requireUserId();
  return getDashboardPageData(userId);
}

/** Fetches analytics subset for PDF report generation. */
export async function fetchResumeReportAnalytics() {
  const userId = await requireUserId();

  const { stats, analytics } = await getDashboardPageData(userId);

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
