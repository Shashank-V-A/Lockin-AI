"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Shows one-time notices on the mock interview listing page. */
export function MockInterviewNotice() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");

  useEffect(() => {
    if (notice === "abandoned") {
      toast.info("That interview was abandoned. Start a new session below.");
    }
  }, [notice]);

  return null;
}
