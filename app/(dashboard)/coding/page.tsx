import { fetchCodingProblems } from "@/actions/coding-actions";
import { ProblemList } from "@/features/coding/problem-list";

export const metadata = { title: "Coding Assessment" };

/** Coding problems listing page. */
export default async function CodingPage() {
  const problems = await fetchCodingProblems();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Coding Assessment</h1>
        <p className="text-sm text-muted-foreground">
          Solve interview problems with a built-in editor and AI feedback.
        </p>
      </div>
      <ProblemList problems={problems} />
    </div>
  );
}
