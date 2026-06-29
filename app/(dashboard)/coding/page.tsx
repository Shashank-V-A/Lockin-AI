import { fetchCodingProblems, fetchCodingProgress } from "@/actions/coding-actions";
import { CodingPageClient } from "@/features/coding/coding-page-client";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Coding Assessment" };

/** Coding problems listing page. */
export default async function CodingPage() {
  const [problems, progress] = await Promise.all([
    fetchCodingProblems(),
    fetchCodingProgress(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Assessment"
        description="Practice 50+ interview problems with a built-in editor, test execution, and AI feedback."
      />
      <CodingPageClient problems={problems} progress={progress} />
    </div>
  );
}
