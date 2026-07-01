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
    <nav className="flex-1 space-y-0.5 p-2">
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
              "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors duration-150",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                active && item.icon !== "AiCoach" && "text-accent",
              )}
              strokeWidth={active ? 2 : 1.75}
            />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
