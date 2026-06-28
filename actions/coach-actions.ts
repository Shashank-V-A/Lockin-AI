"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoachResponse } from "@/services/ai-service";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/** Sends a message to the AI coach and returns the response. */
export async function sendCoachMessage(content: string) {
  const userId = await requireUserId();

  await prisma.coachMessage.create({
    data: { userId, role: "user", content },
  });

  const history = await prisma.coachMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const response = await generateCoachResponse(
    history.map((m) => ({ role: m.role, content: m.content })),
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
