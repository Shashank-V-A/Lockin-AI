"use server";

import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { coachMessageSchema } from "@/lib/validations";
import { COACH_PAGE_SIZE } from "@/lib/coach-config";

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
