"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Code2,
  Sparkles,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPaletteStore } from "@/hooks/use-command-palette-store";
import { NAV_ITEMS } from "@/lib/constants";

const ICON_MAP = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Code2,
  Sparkles,
  Settings,
} as const;

/** Command palette for quick navigation (⌘K). */
export function CommandPalette() {
  const router = useRouter();
  const { isOpen, open, close, toggle } = useCommandPaletteStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const navigate = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(value) => (value ? open() : close())}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            return (
              <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate("/resume")}>
            <FileText className="mr-2 h-4 w-4" />
            Upload Resume
          </CommandItem>
          <CommandItem onSelect={() => navigate("/mock-interview")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Mock Interview
          </CommandItem>
          <CommandItem onSelect={() => navigate("/coding")}>
            <Code2 className="mr-2 h-4 w-4" />
            Coding Assessment
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
