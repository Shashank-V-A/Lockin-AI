"use client";

import { useTheme } from "@/components/theme-provider";
import { Toaster as Sonner } from "sonner";

/** Theme-aware toast notifications. */
export function Toaster(props: React.ComponentProps<typeof Sonner>) {
  const { resolvedTheme = "light" } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-sm",
        },
      }}
      {...props}
    />
  );
}
