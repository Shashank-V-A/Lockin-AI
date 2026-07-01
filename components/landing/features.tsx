import {
  FileSearch,
  Building2,
  Terminal,
  TrendingUp,
  Download,
} from "lucide-react";
import { LANDING_FEATURES } from "@/lib/constants";
import { AiCoachIcon } from "@/components/icons/ai-coach-icon";

const ICONS = { FileSearch, Building2, Terminal, TrendingUp, AiCoach: AiCoachIcon, Download };

/** Landing page features grid. */
export function Features() {
  return (
    <section id="features" className="border-b border-border py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-xl">
          <p className="section-eyebrow">Features</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance">
            Built for serious interview prep
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Each module is focused on a single outcome — score your resume, run realistic mocks,
            practice coding, and get coaching without tab-hopping.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature, i) => {
            const Icon = ICONS[feature.icon as keyof typeof ICONS];
            const featured = i === 0;

            return (
              <article
                key={feature.title}
                className={
                  featured
                    ? "surface-card-hover p-6 sm:col-span-2 lg:col-span-1 lg:row-span-1"
                    : "surface-card-hover p-6"
                }
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/60">
                  {feature.icon === "AiCoach" ? (
                    <AiCoachIcon className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                  )}
                </div>
                <h3 className="font-heading text-sm font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
