"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResumeUploadDropzone } from "@/components/resume-upload-dropzone";
import { saveAndAnalyzeResume, removeResume } from "@/actions/resume-actions";
import { fetchResumeReportAnalytics } from "@/actions/analytics-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import type { ResumeAnalysis } from "@/types/resume";
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
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedId, setSelectedId] = useState(resumes[0]?.id ?? "");

  useEffect(() => {
    if (!pollingId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/resume/status?id=${pollingId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { status: string };
        if (data.status === "COMPLETED") {
          setPollingId(null);
          setAnalyzing(false);
          toast.success("Resume analyzed successfully");
          router.refresh();
        } else if (data.status === "FAILED") {
          setPollingId(null);
          setAnalyzing(false);
          toast.error("Resume analysis failed");
          router.refresh();
        }
      } catch {
        /* retry on next interval */
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [pollingId, router]);

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

      const resumeId = await saveAndAnalyzeResume({
        fileName: file.name,
        fileUrl,
        fileKey: file.key,
        rawText: text,
      });

      setPollingId(resumeId);
      toast.info("Resume queued for analysis — this may take a minute");
      router.refresh();
    } catch (error) {
      setAnalyzing(false);
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume");
    }
  };

  const selected = resumes.find((r) => r.id === selectedId) ?? resumes[0];
  const analysis = selected?.analysis as ResumeAnalysis | null;

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Delete this resume and its analysis?")) return;
    try {
      await removeResume(resumeId);
      toast.success("Resume deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete resume");
    }
  };

  const handleDownloadReport = async () => {
    if (!selected || !analysis) return;

    setDownloading(true);
    try {
      const analytics = await fetchResumeReportAnalytics();
      const { generateResumePDF } = await import("@/lib/pdf");
      await generateResumePDF(selected.fileName, analysis, analytics);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resume Analyzer"
        description="Upload your PDF resume for ATS scoring and actionable feedback."
      />

      <div className="surface-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight">Upload Resume</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">PDF format, up to 8MB</p>
        </div>
        <div className="p-5">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {pollingId ? "Analyzing your resume in the background…" : "Uploading…"}
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

      {resumes.length > 0 && (
        <div className="surface-card p-4">
          <h2 className="text-sm font-semibold tracking-tight">Resume history</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {resumes.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  selected?.id === r.id
                    ? "border-accent/40 bg-accent/10"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <p className="font-medium">{r.fileName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {r.status === "PROCESSING" || r.status === "PENDING"
                    ? "Processing…"
                    : r.status === "COMPLETED" && r.atsScore != null
                      ? `ATS ${r.atsScore}`
                      : r.status}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && analysis && selected.status === "COMPLETED" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{selected.fileName}</p>
                <p className="text-xs text-muted-foreground">Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="tabular-nums text-sm">
                ATS {selected.atsScore}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => handleDelete(selected.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={downloading}
                onClick={handleDownloadReport}
              >
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
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
