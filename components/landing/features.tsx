"use client";

import { motion } from "framer-motion";
import {
  FileSearch,
  Building2,
  Terminal,
  TrendingUp,
  Bot,
  Download,
} from "lucide-react";
import { LANDING_FEATURES } from "@/lib/constants";

const ICONS = { FileSearch, Building2, Terminal, TrendingUp, Bot, Download };

/** Landing page features grid. */
export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            Everything you need to prepare well
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Focused tools for software engineering interviews — no noise, no gimmicks.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon as keyof typeof ICONS];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="surface-card-hover p-6"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
