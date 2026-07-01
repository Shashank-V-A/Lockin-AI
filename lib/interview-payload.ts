/** Serializable interview answer payload for server actions. */
export type InterviewAnswerResult = {
  overallScore: number;
  feedback: string;
  technicalAccuracy: number;
  communication: number;
  confidence: number;
  completeness: number;
  followUpQuestion: string | null;
};

/** Maps a DB answer record to a JSON-safe server action payload. */
export function toInterviewAnswerResult(answer: {
  overallScore: number | null;
  feedback: string | null;
  technicalAccuracy: number | null;
  communication: number | null;
  confidence: number | null;
  completeness: number | null;
  followUpQuestion?: string | null;
}): InterviewAnswerResult {
  return {
    overallScore: answer.overallScore ?? 0,
    feedback: answer.feedback ?? "",
    technicalAccuracy: answer.technicalAccuracy ?? 0,
    communication: answer.communication ?? 0,
    confidence: answer.confidence ?? 0,
    completeness: answer.completeness ?? 0,
    followUpQuestion: answer.followUpQuestion ?? null,
  };
}
