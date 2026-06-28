"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoachResponse } from "@/services/ai-service";
import { revalidatePath } from "next/cache";

/** Sends a message to the AI coach and returns the response. */
export async function sendCoachMessage(content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.coachMessage.create({
    data: { userId: session.user.id, role: "user", content },
  });

  const history = await prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const response = await generateCoachResponse(
    history.map((m) => ({ role: m.role, content: m.content })),
  );

  const assistantMessage = await prisma.coachMessage.create({
    data: { userId: session.user.id, role: "assistant", content: response },
  });

  revalidatePath("/coach");
  return assistantMessage;
}

/** Gets coach conversation history. */
export async function fetchCoachHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
}

/** Clears coach conversation history. */
export async function clearCoachHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.coachMessage.deleteMany({
    where: { userId: session.user.id },
  });

  revalidatePath("/coach");
}
