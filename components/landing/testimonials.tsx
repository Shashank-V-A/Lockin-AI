"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "The mock interviews felt realistic. I knew exactly what to improve before my onsite.",
    author: "Sarah Chen",
    role: "Software Engineer",
  },
  {
    quote: "Resume feedback was specific — not generic AI fluff. My ATS score jumped in one revision.",
    author: "James Okonkwo",
    role: "Backend Engineer",
  },
  {
    quote: "Clean, fast, focused. It feels like a real product built for engineers, not a demo.",
    author: "Priya Sharma",
    role: "Full Stack Engineer",
  },
];

/** Testimonials section. */
export function Testimonials() {
  return (
    <section className="border-t border-border bg-card/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Testimonials</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for serious prep</h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <motion.blockquote
              key={item.author}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="surface-card p-6"
            >
              <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-medium">{item.author}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
