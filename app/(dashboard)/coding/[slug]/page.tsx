import { notFound } from "next/navigation";
import { fetchCodingProblem } from "@/actions/coding-actions";
import { CodingProblemClient } from "@/features/coding/coding-problem-client";

export const metadata = { title: "Coding Problem" };

/** Individual coding problem page. */
export default async function CodingProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await fetchCodingProblem(slug);
  if (!problem) notFound();

  return <CodingProblemClient problem={problem} />;
}
