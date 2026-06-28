import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ProblemListProps {
  problems: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    topic: string;
  }[];
}

/** Coding problems list grid. */
export function ProblemList({ problems }: ProblemListProps) {
  if (problems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No coding problems available. Run database seed to populate.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {problems.map((problem) => (
        <Link key={problem.id} href={`/coding/${problem.slug}`}>
          <Card className="transition-shadow duration-200 hover:shadow-sm">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{problem.title}</span>
                <Badge variant="outline" className="text-xs">{problem.difficulty}</Badge>
                <Badge variant="secondary" className="text-xs">{problem.topic}</Badge>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
