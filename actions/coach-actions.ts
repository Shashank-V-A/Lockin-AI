"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { coachMessageSchema } from "@/lib/validations";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateCoachResponse } from "@/services/ai-service";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
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
    take: 20,
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
