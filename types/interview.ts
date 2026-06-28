export interface AnswerEvaluation {
  technicalAccuracy: number;
  communication: number;
  confidence: number;
  completeness: number;
  overallScore: number;
  feedback: string;
}

export interface InterviewQuestionData {
  id: string;
  order: number;
  question: string;
  category: string;
}

export interface InterviewSessionData {
  id: string;
  company: string;
  role: string;
  experience: string;
  difficulty: string;
  status: string;
  overallScore: number | null;
  questions: InterviewQuestionData[];
  currentQuestionIndex: number;
}

export interface InterviewReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  categoryBreakdown: { category: string; score: number }[];
  recommendations: string[];
}
