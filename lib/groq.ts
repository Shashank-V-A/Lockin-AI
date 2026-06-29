import OpenAI from "openai";
import type { z } from "zod";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

let groqClient: OpenAI | null = null;

/** Returns the shared Groq client (OpenAI-compatible SDK). */
function getGroq(): OpenAI {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: GROQ_BASE_URL,
    });
  }
  return groqClient;
}

/** Resolves the Groq model name from env or default. */
function getModel(): string {
  return process.env.GROQ_MODEL ?? DEFAULT_MODEL;
}

/** Generates structured JSON from Groq with Zod validation and one retry. */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  schema?: z.ZodType<T>,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await getGroq().chat.completions.create({
        model: getModel(),
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              attempt === 0
                ? userPrompt
                : `${userPrompt}\n\nReturn valid JSON only matching the requested schema.`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response from Groq");

      const parsed = JSON.parse(content) as T;
      if (schema) {
        return schema.parse(parsed);
      }
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("JSON generation failed");
    }
  }

  throw lastError ?? new Error("JSON generation failed");
}

/** Generates plain text from Groq chat completion. */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await getGroq().chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
  });

  return response.choices[0]?.message?.content ?? "";
}

/** Multi-turn chat completion with proper message roles. */
export async function generateChat(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const response = await getGroq().chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.5,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content ?? "";
}

/** Streaming chat completion for coach. */
export async function streamChat(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
) {
  return getGroq().chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.5,
    max_tokens: 4096,
    stream: true,
  });
}

export { getGroq, getModel };
