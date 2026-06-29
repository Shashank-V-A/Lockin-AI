import { prisma } from "@/lib/prisma";
import { getLatestResumeScore } from "@/services/resume-service";
import { getAverageInterviewScore, getRecentInterviews } from "@/services/interview-service";
import { getAverageCodingScore } from "@/services/coding-service";
import type { AnalyticsData, DashboardStats } from "@/types/index";
import { format } from "date-fns";

import { cached } from "@/lib/redis";

/** Fetches all dashboard page data (stats + analytics). */
export async function getDashboardPageData(userId: string) {
  const [stats, analytics] = await Promise.all([
    getDashboardStats(userId),
    getAnalyticsData(userId),
  ]);

  return { stats, analytics };
}

/** Computes dashboard statistics for a user. */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  return cached(`dashboard:stats:${userId}`, 90, async () => {
  const [resumeScore, interviewAvg, codingAvg, recentInterviews] = await Promise.all([
    getLatestResumeScore(userId),
    getAverageInterviewScore(userId),
    getAverageCodingScore(userId),
    getRecentInterviews(userId, 5),
  ]);

  const readinessScore = Math.round(
    resumeScore * 0.3 + interviewAvg * 0.4 + codingAvg * 0.3,
  );

  return {
    readinessScore,
    resumeScore,
    interviewAvg,
    codingAvg,
    recentInterviews,
  };
  });
}

/** Aggregates analytics data for charts. */
export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  return cached(`dashboard:analytics:${userId}`, 120, async () => {
  const [resumes, interviews, submissions] = await Promise.all([
    prisma.resume.findMany({
      where: { userId, status: "COMPLETED", atsScore: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { atsScore: true, createdAt: true },
    }),
    prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED", overallScore: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { overallScore: true, company: true, createdAt: true },
    }),
    prisma.codingSubmission.findMany({
      where: { userId, score: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        score: true,
        createdAt: true,
        problem: { select: { topic: true } },
      },
    }),
  ]);

  const resumeScores = [...resumes]
    .reverse()
    .map((r) => ({
      date: format(r.createdAt, "MMM d"),
      score: r.atsScore!,
    }));

  const interviewScores = [...interviews]
    .reverse()
    .map((i) => ({
      date: format(i.createdAt, "MMM d"),
      score: i.overallScore!,
      company: i.company,
    }));

  const codingScores = [...submissions]
    .reverse()
    .map((s) => ({
      date: format(s.createdAt, "MMM d"),
      score: s.score!,
      topic: s.problem.topic,
    }));

  const categoryScores: Record<string, number[]> = {};
  for (const sub of submissions) {
    const topic = sub.problem.topic;
    if (!categoryScores[topic]) categoryScores[topic] = [];
    categoryScores[topic].push(sub.score!);
  }

  const areas = Object.entries(categoryScores).map(([area, scores]) => ({
    area,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  const sorted = [...areas].sort((a, b) => a.score - b.score);
  const weakAreas = sorted.slice(0, 3);
  const strongAreas = [...sorted].reverse().slice(0, 3);

  const timelineEvents = [
    ...resumes.map((r) => ({
      createdAt: r.createdAt,
      date: format(r.createdAt, "MMM d, yyyy"),
      event: `Resume analyzed — ${r.atsScore}% ATS`,
      type: "resume",
    })),
    ...interviews.map((i) => ({
      createdAt: i.createdAt,
      date: format(i.createdAt, "MMM d, yyyy"),
      event: `${i.company} interview — ${i.overallScore}%`,
      type: "interview",
    })),
    ...submissions.slice(-5).map((s) => ({
      createdAt: s.createdAt,
      date: format(s.createdAt, "MMM d, yyyy"),
      event: `Coding: ${s.problem.topic} — ${s.score}%`,
      type: "coding",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)
    .map(({ date, event, type }) => ({ date, event, type }));

  const recentPerformance = [
    {
      label: "Resume Score",
      value: resumeScores.at(-1)?.score ?? 0,
      change: computeChange(resumeScores),
    },
    {
      label: "Interview Avg",
      value: interviewScores.length
        ? Math.round(
            interviewScores.reduce((a, b) => a + b.score, 0) / interviewScores.length,
          )
        : 0,
      change: computeChange(interviewScores.map((s) => ({ score: s.score }))),
    },
    {
      label: "Coding Avg",
      value: codingScores.length
        ? Math.round(codingScores.reduce((a, b) => a + b.score, 0) / codingScores.length)
        : 0,
      change: computeChange(codingScores.map((s) => ({ score: s.score }))),
    },
  ];

  return {
    resumeScores,
    interviewScores,
    codingScores,
    weakAreas,
    strongAreas,
    timeline: timelineEvents,
    recentPerformance,
  };
  });
}

/** Computes percentage change between last two data points. */
function computeChange(data: { score: number }[]): number {
  if (data.length < 2) return 0;
  const prev = data[data.length - 2].score;
  const curr = data[data.length - 1].score;
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}
