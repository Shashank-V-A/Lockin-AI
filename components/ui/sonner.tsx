"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/** Theme-aware toast notifications. */
export function Toaster(props: React.ComponentProps<typeof Sonner>) {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
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
