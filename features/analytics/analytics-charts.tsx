"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import type { AnalyticsData } from "@/types/index";
import { cn } from "@/lib/utils";

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

const CHART_ACCENT = "var(--chart-1)";
const CHART_SECONDARY = "var(--foreground)";

/** Analytics dashboard charts. */
export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Track your interview preparation progress over time."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {data.recentPerformance.map((item) => (
          <div key={item.label} className="surface-card px-5 py-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{item.value}</p>
            <p
              className={cn(
                "mt-1 text-xs tabular-nums",
                item.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
              )}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change}% from last
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Resume Improvement">
          {data.resumeScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.resumeScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={CHART_ACCENT}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Upload a resume to see progress" />
          )}
        </ChartCard>

        <ChartCard title="Interview Scores">
          {data.interviewScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.interviewScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="score" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Complete mock interviews to see scores" />
          )}
        </ChartCard>

        <ChartCard title="Coding Scores">
          {data.codingScores.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.codingScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={CHART_SECONDARY}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Submit coding solutions to see scores" />
          )}
        </ChartCard>

        <ChartCard title="Progress Timeline">
          {data.timeline.length > 0 ? (
            <div className="space-y-3 py-2">
              {data.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="w-20 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {event.date}
                  </span>
                  <span className="leading-relaxed">{event.event}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart message="Activity will appear here as you practice" />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">Strong Areas</h3>
          <div className="mt-4 space-y-3">
            {data.strongAreas.length > 0 ? (
              data.strongAreas.map((area) => (
                <div key={area.area} className="flex items-center justify-between">
                  <span className="text-sm">{area.area}</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {area.score}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Complete assessments to identify strengths.</p>
            )}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold tracking-tight">Weak Areas</h3>
          <div className="mt-4 space-y-3">
            {data.weakAreas.length > 0 ? (
              data.weakAreas.map((area) => (
                <div key={area.area} className="flex items-center justify-between">
                  <span className="text-sm">{area.area}</span>
                  <Badge variant="outline" className="tabular-nums">
                    {area.score}%
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Complete assessments to identify weak areas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
