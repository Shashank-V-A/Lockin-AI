import Link from "next/link";
import { FileText, MessageSquare, Code2, ArrowRight } from "lucide-react";
import type { DashboardStats } from "@/types/index";
import { AiCoachIcon } from "@/components/icons/ai-coach-icon";

interface OnboardingBannerProps {
  stats: DashboardStats;
}

/** First-time user guidance on the dashboard. */
export function OnboardingBanner({ stats }: OnboardingBannerProps) {
  const isNew =
    stats.resumeScore === 0 &&
    stats.interviewAvg === 0 &&
    stats.codingAvg === 0 &&
    stats.recentInterviews.length === 0;

  if (!isNew) return null;

  const steps: (
    | { href: string; label: string; desc: string; icon: typeof FileText }
    | { href: string; label: string; desc: string; isCoach: true }
  )[] = [
    { href: "/resume", label: "Upload resume", icon: FileText, desc: "Get ATS score & feedback" },
    { href: "/mock-interview", label: "Mock interview", icon: MessageSquare, desc: "Practice company questions" },
    { href: "/coding", label: "Solve problems", icon: Code2, desc: "52 coding challenges" },
    { href: "/coach", label: "Ask AI Coach", isCoach: true, desc: "Career & interview help" },
  ];

  return (
    <div className="surface-card border-accent/20 bg-accent/5 p-5">
      <h2 className="text-sm font-semibold tracking-tight">Welcome — here&apos;s how to get started</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Complete these steps to build your interview readiness score.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <Link key={step.href} href={step.href}>
            <div className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:border-accent/30">
              {"isCoach" in step ? (
                <AiCoachIcon className="h-4 w-4 shrink-0" />
              ) : (
                <step.icon className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{step.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">{step.desc}</p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
