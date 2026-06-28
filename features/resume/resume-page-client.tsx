"use client";

import { useState } from "react";
import { ResumeUploadDropzone } from "@/components/resume-upload-dropzone";
import { saveAndAnalyzeResume } from "@/actions/resume-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Download, FileText, Loader2 } from "lucide-react";
import type { ResumeAnalysis } from "@/types/resume";
import { generateResumePDF } from "@/lib/pdf";
import { getUploadFileUrl } from "@/lib/pdf-extract";
import { cn } from "@/lib/utils";

interface UploadedFile {
  url?: string;
  ufsUrl?: string;
  key: string;
  name: string;
}

interface ResumePageClientProps {
  resumes: {
    id: string;
    fileName: string;
    fileUrl: string;
    atsScore: number | null;
    analysis: unknown;
    status: string;
    createdAt: Date;
  }[];
}

/** Resume upload and analysis display. */
export function ResumePageClient({ resumes }: ResumePageClientProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleUploadComplete = async (files: UploadedFile[]) => {
    const file = files[0];
    if (!file) return;

    const fileUrl = getUploadFileUrl(file);
    if (!fileUrl) {
      toast.error("Upload succeeded but file URL was missing");
      return;
    }

    setAnalyzing(true);
    try {
      const extractRes = await fetch("/api/resume/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });

      if (!extractRes.ok) {
        const error = await extractRes.json().catch(() => null);
        throw new Error(error?.error ?? "Failed to extract text");
      }
      const { text } = await extractRes.json();

      await saveAndAnalyzeResume({
        fileName: file.name,
        fileUrl,
        fileKey: file.key,
        rawText: text,
      });

      toast.success("Resume analyzed successfully");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const latest = resumes[0];
  const analysis = latest?.analysis as ResumeAnalysis | null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resume Analyzer"
        description="Upload your PDF resume for ATS scoring and actionable feedback."
      />

      <div className="surface-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">Upload Resume</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">PDF format, up to 4MB</p>
        </div>
        <div className="p-5">
          {analyzing ? (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your resume...
            </div>
          ) : (
            <ResumeUploadDropzone
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
            />
          )}
        </div>
      </div>

      {latest && analysis && latest.status === "COMPLETED" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{latest.fileName}</p>
                <p className="text-xs text-muted-foreground">Latest analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="tabular-nums text-sm">
                ATS {latest.atsScore}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateResumePDF(latest.fileName, analysis)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnalysisCard title="Strengths" items={analysis.strengths} variant="positive" />
            <AnalysisCard title="Weaknesses" items={analysis.weaknesses} variant="negative" />
            <AnalysisCard title="Missing Skills" items={analysis.missingSkills} />
            <AnalysisCard title="Project Feedback" items={analysis.projectFeedback} />
          </div>

          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold tracking-tight">Actionable Suggestions</h3>
            <ol className="mt-4 space-y-2.5">
              {analysis.suggestions.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold tracking-tight">Summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
          </div>
        </>
      )}

      {resumes.length === 0 && (
        <div className="surface-card py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-muted-foreground">
            No resumes uploaded yet. Upload your first resume to get started.
          </p>
        </div>
      )}
    </div>
  );
}

function AnalysisCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant?: "positive" | "negative";
}) {
  return (
    <div className="surface-card p-5">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                variant === "positive" && "bg-emerald-500",
                variant === "negative" && "bg-red-400",
                !variant && "bg-muted-foreground/40",
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
