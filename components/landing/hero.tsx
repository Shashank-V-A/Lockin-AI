"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/** Landing page hero section. */
export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          AI-powered interview preparation
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {APP_NAME}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{APP_TAGLINE}</p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Prepare smarter with resume analysis, company-specific mock interviews,
          coding assessments, and personalized AI coaching.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-11 px-6"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <a href="#features">Explore features</a>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mx-auto mt-16 max-w-4xl rounded-xl border border-border bg-card p-1 shadow-sm"
      >
        <div className="rounded-[10px] bg-[#FAFAFA] p-6 dark:bg-muted/30">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Readiness Score", value: "87%" },
              { label: "Resume ATS", value: "92" },
              { label: "Mock Interviews", value: "12" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
