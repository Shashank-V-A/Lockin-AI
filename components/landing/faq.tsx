"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is Lockin-AI free to use?",
    a: "Yes. The current version is free while we refine the core interview prep experience.",
  },
  {
    q: "What companies are supported for mock interviews?",
    a: "Google, Meta, Amazon, Microsoft, Apple, Netflix, Stripe, Airbnb, Uber, LinkedIn, and more.",
  },
  {
    q: "How does resume analysis work?",
    a: "Upload a PDF resume. We extract the text, analyze it with AI, and return ATS scoring plus specific improvements.",
  },
  {
    q: "Which languages are supported for coding?",
    a: "Python and JavaScript run against real test cases. Java and C++ use static analysis for now.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is tied to your account with encrypted sessions. Resume files are stored via UploadThing with restricted access.",
  },
];

/** FAQ accordion section. */
export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Common questions</h2>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-2">
          {FAQS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border bg-card px-4 shadow-soft"
            >
              <AccordionTrigger className="py-4 text-sm font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
