"use server";

import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { coachMessageSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateCoachResponse } from "@/services/ai-service";
import { getCoachSuggestedPrompts } from "@/services/coach-service";
import { COACH_PAGE_SIZE, COACH_CONTEXT_LIMIT } from "@/lib/coach-config";

/** Gets personalized coach suggested prompts from analytics weak areas. */
export async function fetchCoachSuggestedPrompts() {
  const userId = await requireUserId();
  return getCoachSuggestedPrompts(userId);
}

/** Loads older coach messages before a cursor timestamp. */
export async function loadMoreCoachMessages(beforeIso: string) {
  const userId = await requireUserId();
  const before = new Date(beforeIso);
  if (Number.isNaN(before.getTime())) throw new Error("Invalid cursor");

  const messages = await prisma.coachMessage.findMany({
    where: { userId, createdAt: { lt: before } },
    orderBy: { createdAt: "desc" },
    take: COACH_PAGE_SIZE,
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return messages.reverse();
}

/** Sends a message to the AI coach (non-streaming fallback). */
export async function sendCoachMessage(content: string) {
  const userId = await requireUserId();
  await enforceRateLimit(userId, "coach");
  const message = coachMessageSchema.parse(content);

  await prisma.coachMessage.create({
    data: { userId, role: "user", content: message },
  });

  const history = await prisma.coachMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: COACH_CONTEXT_LIMIT,
    select: { role: true, content: true },
  });

  const response = await generateCoachResponse(
    userId,
    history.reverse().map((m) => ({ role: m.role, content: m.content })),
  );

  const assistantMessage = await prisma.coachMessage.create({
    data: { userId, role: "assistant", content: response },
  });

  revalidatePath("/coach");
  return assistantMessage;
}

/** Clears coach conversation history. */
export async function clearCoachHistory() {
  const userId = await requireUserId();

  await prisma.coachMessage.deleteMany({
    where: { userId },
  });

  revalidatePath("/coach");
}

/** Edits a user message and removes all messages after it. */
export async function editCoachMessage(messageId: string, newContent: string) {
  const userId = await requireUserId();
  const content = coachMessageSchema.parse(newContent);

  const existing = await prisma.coachMessage.findFirst({
    where: { id: messageId, userId, role: "user" },
  });
  if (!existing) throw new Error("Message not found");

  await prisma.coachMessage.update({
    where: { id: messageId },
    data: { content },
  });
  await prisma.coachMessage.deleteMany({
    where: { userId, createdAt: { gt: existing.createdAt } },
  });

  revalidatePath("/coach");
  return { content };
}

/** Deletes an assistant message (and any after) to allow regeneration. */
export async function prepareCoachRegenerate(assistantMessageId: string) {
  const userId = await requireUserId();

  const existing = await prisma.coachMessage.findFirst({
    where: { id: assistantMessageId, userId, role: "assistant" },
  });
  if (!existing) throw new Error("Message not found");

  await prisma.coachMessage.deleteMany({
    where: { userId, createdAt: { gte: existing.createdAt } },
  });

  revalidatePath("/coach");
}
