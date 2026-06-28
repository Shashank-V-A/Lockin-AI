"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "The company-specific mock interviews felt incredibly realistic. I landed my Meta offer after two weeks of practice.",
    author: "Sarah Chen",
    role: "Software Engineer @ Meta",
  },
  {
    quote:
      "Resume analyzer caught gaps I completely missed. My ATS score went from 62 to 91 in one revision cycle.",
    author: "James Okonkwo",
    role: "Backend Engineer @ Stripe",
  },
  {
    quote:
      "Clean, focused, no fluff. Exactly what I needed during my job search — not another generic AI tool.",
    author: "Priya Sharma",
    role: "Full Stack Engineer @ Airbnb",
  },
];

/** Testimonials section. */
export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Trusted by engineers</h2>
        <p className="mt-3 text-muted-foreground">
          Students and professionals preparing for top tech companies.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((item, i) => (
          <motion.blockquote
            key={item.author}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
            <footer className="mt-4">
              <p className="text-sm font-medium">{item.author}</p>
              <p className="text-xs text-muted-foreground">{item.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
