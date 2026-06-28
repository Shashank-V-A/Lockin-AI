"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { APP_NAME } from "@/lib/constants";

/** Landing page footer. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="px-8 py-10 text-center md:px-12 md:py-14">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">
              Start preparing with clarity
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Join engineers using {APP_NAME} to prepare smarter for their next role.
            </p>
            <Button
              className="mt-6 h-10 bg-accent px-5 text-accent-foreground hover:bg-accent/90"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
