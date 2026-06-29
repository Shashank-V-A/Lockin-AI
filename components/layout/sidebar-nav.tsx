"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Code2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { AiCoachIcon } from "@/components/icons/ai-coach-icon";

const ICON_MAP = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Code2,
  AiCoach: AiCoachIcon,
  Settings,
} as const;

interface SidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** Shared dashboard nav links for desktop sidebar and mobile drawer. */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 p-2.5">
      {NAV_ITEMS.map((item) => {
        const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
            )}
            <Icon className={cn("h-4 w-4 shrink-0", active && item.icon !== "AiCoach" && "text-accent")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
