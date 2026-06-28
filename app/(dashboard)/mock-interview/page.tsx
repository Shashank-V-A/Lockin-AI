import { InterviewSetup } from "@/features/interview/interview-setup";
import { fetchRecentInterviews } from "@/actions/interview-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "Mock Interview" };

/** Mock interview setup and history page. */
export default async function MockInterviewPage() {
  const recent = await fetchRecentInterviews();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mock Interview</h1>
        <p className="text-sm text-muted-foreground">
          Practice company-specific interviews with AI evaluation.
        </p>
      </div>

      <InterviewSetup />

      {recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((session) => (
              <Link
                key={session.id}
                href={`/mock-interview/${session.id}`}
                className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
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
                  <Badge variant="outline">{session.status}</Badge>
                  {session.overallScore !== null && (
                    <Badge variant="secondary">{session.overallScore}%</Badge>
                  )}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
