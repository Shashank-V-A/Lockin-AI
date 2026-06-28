import { StructuredData } from "@/components/landing/structured-data";
import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/footer";

/** Landing page with marketing sections. */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <StructuredData />
      <LandingNavbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
}
