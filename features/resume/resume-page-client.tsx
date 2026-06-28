"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing-client";
import { saveAndAnalyzeResume } from "@/actions/resume-actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import type { ResumeAnalysis } from "@/types/resume";
import { generateResumePDF } from "@/lib/pdf";
import { getUploadFileUrl } from "@/lib/pdf-extract";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume Analyzer</h1>
        <p className="text-sm text-muted-foreground">
          Upload your PDF resume for ATS scoring and AI-powered feedback.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          {analyzing ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your resume...
            </div>
          ) : (
            <UploadDropzone
              endpoint="resumeUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
            />
          )}
        </CardContent>
      </Card>

      {latest && analysis && latest.status === "COMPLETED" && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{latest.fileName}</p>
                <p className="text-xs text-muted-foreground">Latest analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="text-sm" style={{ backgroundColor: "#4F46E5" }}>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actionable Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>
        </>
      )}

      {resumes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No resumes uploaded yet. Upload your first resume to get started.
            </p>
          </CardContent>
        </Card>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span
                className={
                  variant === "positive"
                    ? "text-green-600"
                    : variant === "negative"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }
              >
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
