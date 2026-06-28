import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemListProps {
  problems: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    topic: string;
  }[];
}

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "text-emerald-600 dark:text-emerald-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  HARD: "text-red-500 dark:text-red-400",
};

/** Coding problems list grid. */
export function ProblemList({ problems }: ProblemListProps) {
  if (problems.length === 0) {
    return (
      <div className="surface-card py-14 text-center text-sm text-muted-foreground">
        No coding problems available. Run database seed to populate.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {problems.map((problem) => (
        <Link key={problem.id} href={`/coding/${problem.slug}`}>
          <div className="surface-card-hover group flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{problem.title}</span>
              <span
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wide",
                  DIFFICULTY_STYLE[problem.difficulty] ?? "text-muted-foreground",
                )}
              >
                {problem.difficulty.toLowerCase()}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {problem.topic}
              </Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
