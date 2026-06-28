"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    title: "Sign in with Google",
    description: "One click to get started. No passwords, no signup forms.",
  },
  {
    step: "02",
    title: "Upload your resume",
    description: "Get ATS scoring, skill gap analysis, and actionable feedback instantly.",
  },
  {
    step: "03",
    title: "Practice interviews",
    description: "Company-specific mock interviews with real-time AI evaluation.",
  },
  {
    step: "04",
    title: "Track your progress",
    description: "Analytics dashboard shows your improvement over time.",
  },
];

/** How it works section. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-3 text-muted-foreground">Four steps to interview readiness.</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.08 }}
            >
              <span className="text-xs font-medium text-muted-foreground">{item.step}</span>
              <h3 className="mt-2 font-medium">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
