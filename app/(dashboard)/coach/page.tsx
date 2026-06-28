import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoachChat } from "@/features/coach/coach-chat";
import { redirect } from "next/navigation";

export const metadata = { title: "AI Coach" };

/** AI Coach chat page. */
export default async function CoachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const messages = await prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return <CoachChat initialMessages={messages} />;
}
