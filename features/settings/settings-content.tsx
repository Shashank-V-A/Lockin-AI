"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { downloadUserData, deleteUserAccount } from "@/actions/settings-actions";
import { toast } from "sonner";
import { Download, Loader2, Trash2 } from "lucide-react";

/** User settings page. */
export function SettingsContent() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await downloadUserData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lockin-ai-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteUserAccount();
      router.push("/");
    } catch {
      toast.error("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account, data, and appearance preferences."
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
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">Your data</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Export or delete your resumes, interviews, coding submissions, and coach messages.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export data
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:text-red-600">
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete account
          </Button>
        </div>
        <Separator className="my-4" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Authentication is managed via Google OAuth. No password settings available.
        </p>
      </div>
    </div>
  );
}
