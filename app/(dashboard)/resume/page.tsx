import { fetchResumePageData } from "@/actions/resume-actions";
import { ResumePageClient } from "@/features/resume/resume-page-client";
import "./uploadthing.css";

export const metadata = { title: "Resume Analyzer" };

/** Resume upload and analysis page. */
export default async function ResumePage() {
  const { resumes, initialAnalysisId, initialAnalysis } = await fetchResumePageData();
  return (
    <ResumePageClient
      resumes={resumes}
      initialAnalysisId={initialAnalysisId}
      initialAnalysis={initialAnalysis}
    />
  );
}
