"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/** Landing page hero section. */
export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-28 pb-20 md:pt-32 md:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground shadow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Interview preparation platform
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-[3.25rem] md:leading-[1.08]">
          <span className="accent-gradient-text">{APP_NAME}</span>
        </h1>
        <p className="mt-5 text-lg font-medium tracking-tight text-foreground/90 sm:text-xl">
          {APP_TAGLINE}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Resume analysis, company-specific mock interviews, coding practice, and
          progress analytics — built for engineers who want clarity, not clutter.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-10 bg-accent px-5 text-accent-foreground hover:bg-accent/90"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="h-10 px-5" asChild>
            <a href="#features">See how it works</a>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[11px] text-muted-foreground">Dashboard preview</span>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {[
            { label: "Readiness", value: "87", suffix: "%" },
            { label: "Resume ATS", value: "92", suffix: "" },
            { label: "Interviews", value: "12", suffix: "" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card p-6 text-center">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {stat.value}
                <span className="text-lg text-muted-foreground">{stat.suffix}</span>
              </p>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
