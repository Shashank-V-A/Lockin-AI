import { getWeakAreas } from "@/services/analytics-service";

const DEFAULT_PROMPTS = [
  "Explain Two Sum with a Python solution and complexity analysis",
  "How should I answer 'Tell me about yourself' in a SWE interview?",
  "Walk me through designing a URL shortener (system design)",
  "What are common mistakes in binary search implementations?",
];

/** Builds coach suggested prompts from analytics weak areas. */
export async function getCoachSuggestedPrompts(userId: string): Promise<{
  prompts: string[];
  personalized: boolean;
}> {
  try {
    const weak = (await getWeakAreas(userId)).filter((a) => a.score < 70);

    if (weak.length === 0) {
      return { prompts: DEFAULT_PROMPTS, personalized: false };
    }

    const personalized = weak.slice(0, 3).map(
      (area) =>
        `My ${area.area} score is ${area.score}%. Teach me the core concepts I'm missing and give me one practice problem with a walkthrough.`,
    );

    return {
      prompts: [...personalized, ...DEFAULT_PROMPTS.slice(0, Math.max(1, 4 - personalized.length))],
      personalized: true,
    };
  } catch {
    return { prompts: DEFAULT_PROMPTS, personalized: false };
  }
}

export { DEFAULT_PROMPTS };
