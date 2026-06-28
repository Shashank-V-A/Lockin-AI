"use client";

import { motion } from "framer-motion";

const STEPS = [
  { step: "01", title: "Sign in with Google", description: "One click. No passwords or signup forms." },
  { step: "02", title: "Upload your resume", description: "Get ATS scoring and actionable feedback in minutes." },
  { step: "03", title: "Practice interviews", description: "Company-specific mocks with structured evaluation." },
  { step: "04", title: "Track progress", description: "See improvement across resume, interviews, and coding." },
];

/** How it works section. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Process</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-3 text-sm text-muted-foreground">Four steps from sign-in to interview readiness.</p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-border lg:block" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
                className="relative"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold shadow-soft">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
