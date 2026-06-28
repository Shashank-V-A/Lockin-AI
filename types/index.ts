import type { ResumeAnalysis } from "@/types/resume";
import type { InterviewReport } from "@/types/interview";
import type { CodingFeedback } from "@/types/coding";

export type { ResumeAnalysis } from "@/types/resume";
export type { InterviewReport, AnswerEvaluation } from "@/types/interview";
export type { CodingFeedback } from "@/types/coding";

export type { DashboardPageData } from "@/types/dashboard";
export interface DashboardStats {
  readinessScore: number;
  resumeScore: number;
  interviewAvg: number;
  codingAvg: number;
  recentInterviews: {
    id: string;
    company: string;
    role: string;
    overallScore: number | null;
    createdAt: Date;
  }[];
}

export interface AnalyticsData {
  resumeScores: { date: string; score: number }[];
  interviewScores: { date: string; score: number; company: string }[];
  codingScores: { date: string; score: number; topic: string }[];
  weakAreas: { area: string; score: number }[];
  strongAreas: { area: string; score: number }[];
  timeline: { date: string; event: string; type: string }[];
  recentPerformance: {
    label: string;
    value: number;
    change: number;
  }[];
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export type ReportData = ResumeAnalysis | InterviewReport | CodingFeedback;
