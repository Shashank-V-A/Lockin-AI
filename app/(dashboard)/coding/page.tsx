import { fetchCodingProblems } from "@/actions/coding-actions";
import { ProblemList } from "@/features/coding/problem-list";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Coding Assessment" };

/** Coding problems listing page. */
export default async function CodingPage() {
  const problems = await fetchCodingProblems();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Coding Assessment"
        description="Solve interview problems with a built-in editor and real test execution."
      />
      <ProblemList problems={problems} />
    </div>
  );
}
