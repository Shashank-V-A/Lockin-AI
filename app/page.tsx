import { Suspense } from "react";
import { StructuredData } from "@/components/landing/structured-data";
import { LandingNavbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/footer";
import { AuthErrorToast } from "@/components/landing/auth-error-toast";

/** Landing page with marketing sections. */
export default function HomePage() {
  return (
    <div className="min-h-screen page-canvas">
      <StructuredData />
      <Suspense fallback={null}>
        <AuthErrorToast />
      </Suspense>
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
