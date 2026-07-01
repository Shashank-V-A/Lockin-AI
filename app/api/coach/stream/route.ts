import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCoachSystemPrompt } from "@/services/ai-service";
import { coachMessageSchema } from "@/lib/validations";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { streamChat } from "@/lib/groq";
import { logger, logAiUsage } from "@/lib/logger";
import { COACH_CONTEXT_LIMIT } from "@/lib/coach-config";

export const maxDuration = 60;
export const runtime = "nodejs";

/** Streams AI Coach responses via SSE. */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? undefined;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const start = Date.now();

  try {
    await enforceRateLimit(userId, "coach");

    const { message, skipUserMessage } = (await request.json()) as {
      message?: string;
      skipUserMessage?: boolean;
    };
    const content = coachMessageSchema.parse(message);

    if (!skipUserMessage) {
      await prisma.coachMessage.create({
        data: { userId, role: "user", content },
      });
    }

    const history = await prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: COACH_CONTEXT_LIMIT,
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

    logAiUsage({ feature: "coach", userId, requestId });

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

          logger.info("coach.stream_complete", {
            requestId,
            userId,
            durationMs: Date.now() - start,
            chars: fullText.length,
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, id: assistantMessage.id })}\n\n`),
          );
          controller.close();
        } catch (err) {
          logger.error("coach.stream_failed", {
            requestId,
            userId,
            error: err instanceof Error ? err.message : "unknown",
          });
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
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    logger.error("coach.request_failed", {
      requestId,
      userId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
