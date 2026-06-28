export interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  projectFeedback: string[];
  suggestions: string[];
  summary: string;
}

export interface ResumeWithAnalysis {
  id: string;
  fileName: string;
  fileUrl: string;
  atsScore: number | null;
  analysis: ResumeAnalysis | null;
  status: string;
  createdAt: Date;
}
