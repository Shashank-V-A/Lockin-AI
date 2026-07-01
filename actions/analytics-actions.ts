"use server";

import { requireUserId } from "@/lib/session";
import { getDashboardPageData } from "@/services/analytics-service";

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
