/** Analytics data included in downloadable PDF reports. */
export interface ResumeReportAnalytics {
  readinessScore: number;
  resumeScore: number;
  interviewAvg: number;
  codingAvg: number;
  resumeHistory: { date: string; score: number }[];
  recentPerformance: { label: string; value: number; change: number }[];
  strongAreas: { area: string; score: number }[];
  weakAreas: { area: string; score: number }[];
}
