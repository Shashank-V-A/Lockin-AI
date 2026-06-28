"use client";

import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** User settings page. */
export function SettingsContent() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and appearance preferences."
      />

      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <Avatar className="h-11 w-11 ring-2 ring-border">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Appearance</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark mode
              </Label>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch
              id="dark-mode"
              checked={resolvedTheme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          <Separator />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Authentication is managed via Google OAuth. No password settings available.
          </p>
        </div>
      </div>
    </div>
  );
}
