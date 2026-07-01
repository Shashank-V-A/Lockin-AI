"use client";

import { signIn } from "next-auth/react";
import { ArrowRight, BarChart3, Code2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/** Landing page hero section. */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-32">
        <div className="landing-fade-up max-w-xl">
          <p className="section-eyebrow">Interview preparation</p>
          <h1 className="mt-4 text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Prepare with structure, not guesswork.
          </h1>
          <p className="mt-2 text-lg font-medium text-foreground/85">{APP_TAGLINE}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {APP_NAME} combines resume analysis, company-specific mock interviews, a curated
            coding library, and an AI coach — so you always know what to work on next.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              variant="accent"
              className="h-10 px-5"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Continue with Google
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="h-10 px-5" asChild>
              <a href="#features">Explore features</a>
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {[
              { label: "Problems", value: "52+" },
              { label: "Modules", value: "4" },
              { label: "Setup", value: "1 min" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 font-heading text-xl font-semibold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="landing-fade-up landing-fade-up-delay-2">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#e06b5c]" />
                <span className="h-2 w-2 rounded-full bg-[#e6b84d]" />
                <span className="h-2 w-2 rounded-full bg-[#5cad6a]" />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">lockin — dashboard</span>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-3">
              {[
                { label: "Readiness", value: "87", suffix: "%", icon: BarChart3 },
                { label: "Resume ATS", value: "92", suffix: "", icon: FileText },
                { label: "Coding avg", value: "78", suffix: "%", icon: Code2 },
              ].map((stat) => (
                <div key={stat.label} className="bg-card p-5">
                  <stat.icon className="mb-3 h-4 w-4 text-accent" strokeWidth={1.75} />
                  <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
                    {stat.value}
                    <span className="text-base font-medium text-muted-foreground">{stat.suffix}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Recent mock interview</span>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Google — SWE
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[72%] rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
