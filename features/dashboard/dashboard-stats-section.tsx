import { requireUserId } from "@/lib/session";
import { getDashboardStats } from "@/services/analytics-service";
import { OnboardingBanner } from "@/features/dashboard/onboarding-banner";
import { ProgressRing } from "@/components/progress-ring";
import { AnimatedCounter } from "@/components/animated-counter";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

/** Loads dashboard stats in a streaming boundary. */
export async function DashboardStatsSection() {
  const userId = await requireUserId();
  const stats = await getDashboardStats(userId);

  return (
    <>
      <OnboardingBanner stats={stats} />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="surface-card flex flex-col items-center px-6 py-8 lg:col-span-1">
          <ProgressRing value={stats.readinessScore} label="Score" />
          <p className="mt-5 font-heading text-sm font-medium">Interview Readiness</p>
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

      <div className="surface-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-sm font-semibold tracking-tight">Recent Interviews</h2>
        </div>
        <div className="p-2">
          {stats.recentInterviews.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No interviews yet. Start your first mock interview.
            </p>
          ) : (
            <div className="space-y-1">
              {stats.recentInterviews.map((interview) => (
                <Link key={interview.id} href={`/mock-interview/${interview.id}`}>
                  <div className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/50">
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
