"use client";

import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { cn } from "@/lib/utils";

const CommandPalette = dynamic(
  () => import("@/components/layout/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

/** Dashboard layout shell with sidebar and navbar. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="min-h-screen bg-background page-grid">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen transition-[margin] duration-200 ease-out",
          collapsed ? "md:ml-[68px]" : "md:ml-[240px]",
        )}
      >
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
