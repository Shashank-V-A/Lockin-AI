const STEPS = [
  { step: "01", title: "Sign in with Google", description: "One click. No passwords or signup forms." },
  { step: "02", title: "Upload your resume", description: "Get ATS scoring and actionable feedback in minutes." },
  { step: "03", title: "Practice interviews", description: "Company-specific mocks with structured evaluation." },
  { step: "04", title: "Track progress", description: "See improvement across resume, interviews, and coding." },
];

/** How it works section. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-xl">
          <p className="section-eyebrow">Process</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Four steps from sign-in to a clear readiness picture.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li key={item.step} className="relative border-t border-border pt-6">
              <span className="font-mono text-xs font-medium text-accent">{item.step}</span>
              <h3 className="mt-3 font-heading text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
