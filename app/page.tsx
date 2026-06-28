import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";

import { StructuredData } from "@/components/landing/structured-data";

/** Landing page with marketing sections. */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background">
      <StructuredData />
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
