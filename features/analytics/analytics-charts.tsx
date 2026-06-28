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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsData } from "@/types/index";

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

/** Analytics dashboard charts. */
export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your interview preparation progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {data.recentPerformance.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{item.value}</p>
              <p className={`text-xs mt-1 ${item.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                {item.change >= 0 ? "+" : ""}{item.change}% from last
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Resume Improvement</CardTitle></CardHeader>
          <CardContent>
            {data.resumeScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.resumeScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Upload a resume to see progress" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Interview Scores</CardTitle></CardHeader>
          <CardContent>
            {data.interviewScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.interviewScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Complete mock interviews to see scores" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Coding Scores</CardTitle></CardHeader>
          <CardContent>
            {data.codingScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.codingScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#111111" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Submit coding solutions to see scores" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Progress Timeline</CardTitle></CardHeader>
          <CardContent>
            {data.timeline.length > 0 ? (
              <div className="space-y-3">
                {data.timeline.map((event, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-accent shrink-0" style={{ backgroundColor: "#4F46E5" }} />
                    <span className="text-muted-foreground text-xs w-24 shrink-0">{event.date}</span>
                    <span>{event.event}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart message="Activity will appear here as you practice" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Strong Areas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.strongAreas.length > 0 ? (
              data.strongAreas.map((area) => (
                <div key={area.area} className="flex items-center justify-between">
                  <span className="text-sm">{area.area}</span>
                  <Badge variant="secondary">{area.score}%</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Complete assessments to identify strengths.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Weak Areas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.weakAreas.length > 0 ? (
              data.weakAreas.map((area) => (
                <div key={area.area} className="flex items-center justify-between">
                  <span className="text-sm">{area.area}</span>
                  <Badge variant="outline">{area.score}%</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Complete assessments to identify weak areas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
