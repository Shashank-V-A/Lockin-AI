import Link from "next/link";
import { FileText, MessageSquare, Code2, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AiCoachIcon } from "@/components/icons/ai-coach-icon";

interface DashboardContentProps {
  stats: React.ReactNode;
  analytics?: React.ReactNode;
}

/** Unified dashboard shell with streaming stats and analytics slots. */
export function DashboardContent({ stats, analytics }: DashboardContentProps) {
  const quickActions = [
    { href: "/resume", label: "Upload Resume", icon: FileText, desc: "ATS score & feedback" },
    { href: "/mock-interview", label: "Mock Interview", icon: MessageSquare, desc: "Company-specific practice" },
    { href: "/coding", label: "Coding", icon: Code2, desc: "52 curated problems" },
    { href: "/coach", label: "AI Coach", icon: null, desc: "Career guidance", isCoach: true },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Your interview preparation progress across resume, mocks, coding, and coaching."
      />

      {stats}

      {analytics}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-sm font-semibold">Quick actions</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Jump back into your prep workflow</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <div className="surface-card-hover flex h-full items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50">
                    {action.isCoach ? (
                      <AiCoachIcon className="h-4 w-4" />
                    ) : (
                      action.icon && (
                        <action.icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                      )
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
