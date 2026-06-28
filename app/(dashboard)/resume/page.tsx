import { fetchUserResumes } from "@/actions/resume-actions";
import { ResumePageClient } from "@/features/resume/resume-page-client";

export const metadata = { title: "Resume Analyzer" };

/** Resume upload and analysis page. */
export default async function ResumePage() {
  const resumes = await fetchUserResumes();
  return <ResumePageClient resumes={resumes} />;
}
