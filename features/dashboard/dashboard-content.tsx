import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { AnimatedCounter } from "@/components/animated-counter";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, FileText, MessageSquare, Code2, BarChart3 } from "lucide-react";
import type { DashboardStats } from "@/types/index";
import { formatDistanceToNow } from "date-fns";

interface DashboardContentProps {
  stats: DashboardStats;
}

/** Main dashboard content with stats and quick actions. */
export function DashboardContent({ stats }: DashboardContentProps) {
  const quickActions = [
    { href: "/resume", label: "Upload Resume", icon: FileText, desc: "Analyze your resume" },
    { href: "/mock-interview", label: "Mock Interview", icon: MessageSquare, desc: "Start practicing" },
    { href: "/coding", label: "Coding Assessment", icon: Code2, desc: "Solve problems" },
    { href: "/analytics", label: "View Analytics", icon: BarChart3, desc: "Track progress" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your interview preparation overview.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6">
            <ProgressRing value={stats.readinessScore} label="Readiness" />
            <p className="mt-4 text-sm font-medium">Interview Readiness</p>
            <p className="text-xs text-muted-foreground">Combined score</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
          {[
            { label: "Resume Score", value: stats.resumeScore, suffix: "" },
            { label: "Interview Avg", value: stats.interviewAvg, suffix: "%" },
            { label: "Coding Avg", value: stats.codingAvg, suffix: "%" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcomingPlan.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentInterviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No interviews yet. Start your first mock interview.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {interview.company} — {interview.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {interview.overallScore !== null && (
                      <Badge variant="secondary">{interview.overallScore}%</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-base font-medium">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="transition-shadow duration-200 hover:shadow-sm">
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
