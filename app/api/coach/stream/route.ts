import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCoachSystemPrompt } from "@/services/ai-service";
import { coachMessageSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { streamChat } from "@/lib/groq";

/** Streams AI Coach responses via SSE. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await enforceRateLimit(userId, "coach");

    const { message } = (await request.json()) as { message?: string };
    const content = coachMessageSchema.parse(message);

    await prisma.coachMessage.create({
      data: { userId, role: "user", content },
    });

    const history = await prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { role: true, content: true },
    });

    const systemPrompt = await buildCoachSystemPrompt(userId);
    const chatMessages = history
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const stream = await streamChat(systemPrompt, chatMessages);
    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              fullText += delta;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }

          const assistantMessage = await prisma.coachMessage.create({
            data: { userId, role: "assistant", content: fullText },
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, id: assistantMessage.id })}\n\n`),
          );
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Stream failed" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "RateLimitError") {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
