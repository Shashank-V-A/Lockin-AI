import { notFound } from "next/navigation";
import { fetchCodingProblemPageData } from "@/actions/coding-actions";
import { CodingProblemClient } from "@/features/coding/coding-problem-client";

export const metadata = { title: "Coding Problem" };

/** Individual coding problem page. */
export default async function CodingProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await fetchCodingProblemPageData(slug);
  if (!data) notFound();

  return (
    <CodingProblemClient
      problem={data.problem}
      initialDraft={data.draft}
      initialBookmarked={data.bookmarked}
    />
  );
}
