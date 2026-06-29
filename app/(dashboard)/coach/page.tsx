import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoachChat } from "@/features/coach/coach-chat";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "AI Coach" };

async function CoachMessages() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const messages = await prisma.coachMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return <CoachChat initialMessages={messages} />;
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
