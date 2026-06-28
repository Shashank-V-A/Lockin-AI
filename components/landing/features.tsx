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
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Everything you need to prepare</h2>
        <p className="mt-3 text-muted-foreground">
          Focused tools designed for software engineering interview success.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_FEATURES.map((feature, i) => {
          const Icon = ICONS[feature.icon as keyof typeof ICONS];
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
