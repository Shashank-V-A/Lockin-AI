import { Suspense } from "react";
import { InterviewSetup } from "@/features/interview/interview-setup";
import { MockInterviewNotice } from "@/features/interview/mock-interview-notice";
import { fetchRecentInterviews } from "@/actions/interview-actions";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "Mock Interview" };

/** Mock interview setup and history page. */
export default async function MockInterviewPage() {
  const recent = await fetchRecentInterviews();

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <MockInterviewNotice />
      </Suspense>
      <PageHeader
        title="Mock Interview"
        description="Practice company-specific interviews with structured AI evaluation."
      />

      <InterviewSetup />

      {recent.length > 0 && (
        <div className="surface-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold tracking-tight">Recent Sessions</h2>
          </div>
          <div className="space-y-1 p-2">
            {recent.map((session) => (
              <Link
                key={session.id}
                href={
                  session.status === "IN_PROGRESS"
                    ? `/mock-interview/${session.id}`
                    : "/mock-interview"
                }
                className="group flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-medium">
                    {session.company} — {session.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {session.status.toLowerCase()}
                  </Badge>
                  {session.overallScore !== null && (
                    <Badge variant="secondary" className="tabular-nums">
                      {session.overallScore}%
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
