import { Suspense } from "react";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CoachChat } from "@/features/coach/coach-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoachSuggestedPrompts } from "@/services/coach-service";
import { COACH_PAGE_SIZE } from "@/lib/coach-config";

export const metadata = { title: "AI Coach" };

async function CoachMessages() {
  const userId = await requireUserId();

  const [messages, promptData, total] = await Promise.all([
    prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: COACH_PAGE_SIZE,
      select: { id: true, role: true, content: true, createdAt: true },
    }),
    getCoachSuggestedPrompts(userId),
    prisma.coachMessage.count({ where: { userId } }),
  ]);

  return (
    <CoachChat
      initialMessages={messages.reverse()}
      hasMore={total > messages.length}
      suggestedPrompts={promptData.prompts}
      personalizedPrompts={promptData.personalized}
    />
  );
}

function CoachLoading() {
  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-4">
      <div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Skeleton className="min-h-0 flex-1 rounded-xl" />
    </div>
  );
}

/** AI Coach chat page. */
export default function CoachPage() {
  return (
    <Suspense fallback={<CoachLoading />}>
      <CoachMessages />
    </Suspense>
  );
}
