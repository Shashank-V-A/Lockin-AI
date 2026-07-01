import Link from "next/link";
import { FileText, MessageSquare, Code2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AiCoachIcon } from "@/components/icons/ai-coach-icon";

interface DashboardContentProps {
  stats: React.ReactNode;
  analytics?: React.ReactNode;
}

/** Unified dashboard shell with streaming stats and analytics slots. */
export function DashboardContent({ stats, analytics }: DashboardContentProps) {
  const quickActions = [
    { href: "/resume", label: "Upload Resume", icon: FileText, desc: "Analyze your resume" },
    { href: "/mock-interview", label: "Mock Interview", icon: MessageSquare, desc: "Start practicing" },
    { href: "/coding", label: "Coding Assessment", icon: Code2, desc: "Solve problems" },
    { href: "/coach", label: "AI Coach", icon: FileText, desc: "Get career guidance" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your interview preparation overview, progress, and analytics in one place."
      />

      {stats}

      {analytics}

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="surface-card-hover group flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-accent/10">
                  {action.href === "/coach" ? (
                    <AiCoachIcon className="h-4 w-4" />
                  ) : (
                    <action.icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                  )}
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
