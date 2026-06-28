import { fetchCoachHistory } from "@/actions/coach-actions";
import { CoachChat } from "@/features/coach/coach-chat";

export const metadata = { title: "AI Coach" };

/** AI Coach chat page. */
export default async function CoachPage() {
  const messages = await fetchCoachHistory();
  return <CoachChat initialMessages={messages} />;
}
