"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Error boundary for dashboard routes. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Error</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button variant="accent" onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
