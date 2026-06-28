import { redirect } from "next/navigation";

/** Analytics merged into dashboard — redirect legacy route. */
export default function AnalyticsPage() {
  redirect("/dashboard");
}
