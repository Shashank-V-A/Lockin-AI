import { notFound } from "next/navigation";
import { fetchInterviewSession } from "@/actions/interview-actions";
import { InterviewSessionClient } from "@/features/interview/interview-session-client";

export const metadata = { title: "Interview Session" };

/** Active mock interview session page. */
export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await fetchInterviewSession(id);
  if (!session) notFound();

  return <InterviewSessionClient session={session} />;
}
