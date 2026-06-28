import OpenAI from "openai";

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

/** Generates structured JSON from Groq chat completion. */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
): Promise<T> {
  const response = await getGroq().chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from Groq");
  }

  return JSON.parse(content) as T;
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
