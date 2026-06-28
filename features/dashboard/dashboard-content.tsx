import { ProgressRing } from "@/components/progress-ring";
import { AnimatedCounter } from "@/components/animated-counter";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
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
      <PageHeader
        title="Dashboard"
        description="Your interview preparation overview at a glance."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="surface-card flex flex-col items-center px-6 py-8 lg:col-span-1">
          <ProgressRing value={stats.readinessScore} label="Score" />
          <p className="mt-5 text-sm font-medium">Interview Readiness</p>
          <p className="text-xs text-muted-foreground">Combined across all modules</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
          {[
            { label: "Resume Score", value: stats.resumeScore, suffix: "" },
            { label: "Interview Avg", value: stats.interviewAvg, suffix: "%" },
            { label: "Coding Avg", value: stats.codingAvg, suffix: "%" },
          ].map((stat) => (
            <div key={stat.label} className="surface-card px-5 py-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Upcoming Plan</h2>
          </div>
          <div className="space-y-1 p-2">
            {stats.upcomingPlan.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Recent Interviews</h2>
          </div>
          <div className="p-2">
            {stats.recentInterviews.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No interviews yet. Start your first mock interview.
              </p>
            ) : (
              <div className="space-y-1">
                {stats.recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between rounded-lg px-3 py-3"
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
                      <Badge variant="secondary" className="tabular-nums">
                        {interview.overallScore}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="surface-card-hover group flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-accent/10">
                  <action.icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
