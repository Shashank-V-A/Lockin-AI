"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/progress-ring";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Code2,
  Filter,
  Search,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodingProgress } from "@/services/coding-service";

interface CodingPageClientProps {
  problems: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    topic: string;
  }[];
  progress: CodingProgress;
  bookmarkIds: string[];
}

type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD";
type StatusFilter = "ALL" | "SOLVED" | "ATTEMPTED" | "UNSOLVED" | "BOOKMARKED";

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-[var(--success)]",
  MEDIUM: "bg-[color-mix(in_oklab,var(--warning)_14%,transparent)] text-[var(--warning)]",
  HARD: "bg-destructive/10 text-destructive",
};

const DIFFICULTY_BORDER: Record<string, string> = {
  EASY: "border-l-[var(--success)]",
  MEDIUM: "border-l-[var(--warning)]",
  HARD: "border-l-destructive",
};

/** Redesigned coding problems page with scorecard, filters, and search. */
export function CodingPageClient({ problems, progress, bookmarkIds }: CodingPageClientProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [topic, setTopic] = useState("ALL");

  const solvedSet = useMemo(() => new Set(progress.solvedIds), [progress.solvedIds]);
  const attemptedSet = useMemo(() => new Set(progress.attemptedIds), [progress.attemptedIds]);
  const bookmarkSet = useMemo(() => new Set(bookmarkIds), [bookmarkIds]);

  const topics = useMemo(
    () => ["ALL", ...Array.from(new Set(problems.map((p) => p.topic))).sort()],
    [problems],
  );

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const isSolved = solvedSet.has(p.id);
      const isAttempted = attemptedSet.has(p.id) && !isSolved;

      if (difficulty !== "ALL" && p.difficulty !== difficulty) return false;
      if (topic !== "ALL" && p.topic !== topic) return false;
      if (status === "SOLVED" && !isSolved) return false;
      if (status === "ATTEMPTED" && !isAttempted) return false;
      if (status === "UNSOLVED" && (isSolved || isAttempted)) return false;
      if (status === "BOOKMARKED" && !bookmarkSet.has(p.id)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.slug.includes(q)
        );
      }
      return true;
    });
  }, [problems, difficulty, topic, status, search, solvedSet, attemptedSet, bookmarkSet]);

  const pct = progress.total > 0 ? Math.round((progress.solved / progress.total) * 100) : 0;

  if (problems.length === 0) {
    return (
      <div className="surface-card py-16 text-center">
        <Code2 className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        <p className="mt-4 text-sm font-medium">No problems loaded</p>
        <p className="mt-1 text-xs text-muted-foreground">Run `npm run db:seed` to populate the question bank.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scorecard */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="surface-card flex flex-col items-center justify-center px-8 py-6">
          <ProgressRing value={pct} label="%" size={100} strokeWidth={5} />
          <p className="mt-3 text-sm font-medium">Completion</p>
          <p className="text-xs text-muted-foreground">
            {progress.solved} of {progress.total} solved
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Trophy}
            label="Solved"
            value={progress.solved}
            sub={`${progress.unsolved} remaining`}
            accent="text-[var(--success)]"
          />
          <StatCard
            icon={Target}
            label="Attempted"
            value={progress.attempted}
            sub={`${Math.max(0, progress.attempted - progress.solved)} in progress`}
            accent="text-[var(--warning)]"
          />
          <StatCard
            icon={Circle}
            label="Unsolved"
            value={progress.unsolved}
            sub="Not yet passed"
            accent="text-muted-foreground"
          />
          <div className="surface-card px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              By difficulty
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <DifficultyBar label="Easy" count={progress.byDifficulty.easy} total={problems.filter((p) => p.difficulty === "EASY").length} color="bg-[var(--success)]" />
              <DifficultyBar label="Medium" count={progress.byDifficulty.medium} total={problems.filter((p) => p.difficulty === "MEDIUM").length} color="bg-[var(--warning)]" />
              <DifficultyBar label="Hard" count={progress.byDifficulty.hard} total={problems.filter((p) => p.difficulty === "HARD").length} color="bg-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title or topic..."
            className="border-border/80 bg-background pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3 w-3" />
            Difficulty
          </span>
          {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((d) => (
            <FilterPill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </FilterPill>
          ))}

          <span className="mx-2 hidden h-4 w-px bg-border sm:block" />

          <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          {(
            [
              ["ALL", "All"],
              ["SOLVED", "Solved"],
              ["ATTEMPTED", "Attempted"],
              ["UNSOLVED", "Unsolved"],
              ["BOOKMARKED", "Bookmarked"],
            ] as const
          ).map(([value, label]) => (
            <FilterPill key={value} active={status === value} onClick={() => setStatus(value)}>
              {label}
            </FilterPill>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <FilterPill key={t} active={topic === t} onClick={() => setTopic(t)} size="sm">
              {t === "ALL" ? "All topics" : t}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Problem list */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          {problems.length} problems
        </p>
      </div>

      <div className="grid gap-2">
        {filtered.length === 0 ? (
          <div className="surface-card py-12 text-center text-sm text-muted-foreground">
            No problems match your filters.
          </div>
        ) : (
          filtered.map((problem) => {
            const isSolved = solvedSet.has(problem.id);
            const isAttempted = attemptedSet.has(problem.id) && !isSolved;
            const isBookmarked = bookmarkSet.has(problem.id);
            const num = problems.findIndex((x) => x.id === problem.id) + 1;

            return (
              <Link key={problem.id} href={`/coding/${problem.slug}`}>
                <div
                  className={cn(
                    "surface-card-hover group flex items-center gap-4 border-l-[3px] px-4 py-3.5 sm:px-5",
                    DIFFICULTY_BORDER[problem.difficulty] ?? "border-l-border",
                  )}
                >
                  <span className="hidden w-8 shrink-0 text-xs tabular-nums text-muted-foreground sm:block">
                    #{num}
                  </span>

                  <div className="shrink-0">
                    {isSolved ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={1.75} />
                    ) : isAttempted ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-border" strokeWidth={1.75} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{problem.title}</span>
                      {isBookmarked && (
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      )}
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          DIFFICULTY_STYLE[problem.difficulty],
                        )}
                      >
                        {problem.difficulty.toLowerCase()}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {problem.topic}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isSolved ? "Solved" : isAttempted ? "Attempted — keep going" : "Not started"}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="surface-card px-4 py-4">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", accent)} strokeWidth={1.75} />
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function DifficultyBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right tabular-nums text-muted-foreground">
        {count}/{total}
      </span>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border font-medium transition-colors",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        active
          ? "border-accent/40 bg-accent/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
