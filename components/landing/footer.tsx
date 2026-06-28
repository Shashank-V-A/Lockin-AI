"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

/** Landing page footer. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to ace your next interview?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Join engineers preparing smarter with {APP_NAME}.
          </p>
          <Button
            className="mt-6"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Get started free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
              P
            </div>
            <span className="text-sm font-medium">{APP_NAME}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
