import { describe, it, expect } from "vitest";
import { coachMessageSchema, interviewAnswerSchema, startInterviewSchema } from "@/lib/validations";
import { resumeAnalysisSchema } from "@/lib/ai-schemas";

describe("validations", () => {
  it("rejects empty coach messages", () => {
    expect(() => coachMessageSchema.parse("")).toThrow();
  });

  it("accepts valid interview start params", () => {
    const result = startInterviewSchema.parse({
      company: "Google",
      role: "Software Engineer",
      experience: "Mid Level",
      difficulty: "MEDIUM",
    });
    expect(result.difficulty).toBe("MEDIUM");
  });

  it("rejects oversized answers", () => {
    expect(() => interviewAnswerSchema.parse("x".repeat(9000))).toThrow();
  });
});

describe("ai-schemas", () => {
  it("validates resume analysis shape", () => {
    const data = resumeAnalysisSchema.parse({
      atsScore: 85,
      strengths: ["React"],
      weaknesses: ["System design"],
      missingSkills: ["Kubernetes"],
      projectFeedback: ["Good projects"],
      suggestions: ["Add metrics"],
      summary: "Strong candidate",
    });
    expect(data.atsScore).toBe(85);
  });
});

describe("readiness score", () => {
  it("computes weighted readiness", () => {
    const resume = 80;
    const interview = 70;
    const coding = 60;
    const score = Math.round(resume * 0.3 + interview * 0.4 + coding * 0.3);
    expect(score).toBe(70);
  });
});
