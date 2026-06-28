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
    a: "Yes, the MVP is completely free. Focus on preparing for your interviews without worrying about subscriptions.",
  },
  {
    q: "What companies are supported for mock interviews?",
    a: "You can practice for Google, Meta, Amazon, Microsoft, Apple, Netflix, Stripe, Airbnb, Uber, LinkedIn, and more.",
  },
  {
    q: "How does resume analysis work?",
    a: "Upload your PDF resume. We extract the text, analyze it with AI, and provide ATS scoring, strengths, weaknesses, and actionable suggestions.",
  },
  {
    q: "Do you support coding in multiple languages?",
    a: "Yes — Python, Java, JavaScript, and C++ are supported in the coding assessment module with a built-in Monaco editor.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is stored securely with encrypted sessions. Resume files are stored via UploadThing with access restricted to your account.",
  },
];

/** FAQ accordion section. */
export function FAQ() {
  return (
    <section id="faq" className="border-t border-border bg-card">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
          <p className="mt-3 text-muted-foreground">Common questions answered.</p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm font-medium">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
