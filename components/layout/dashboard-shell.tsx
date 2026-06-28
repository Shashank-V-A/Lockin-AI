"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { cn } from "@/lib/utils";

/** Dashboard layout shell with sidebar and navbar. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div className="min-h-screen bg-background page-grid">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen transition-[margin] duration-200 ease-out",
          collapsed ? "ml-[68px]" : "ml-[240px]",
        )}
      >
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
