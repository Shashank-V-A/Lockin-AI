import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

/** Custom 404 page. */
export default function NotFound() {
  return (
    <div className="page-canvas flex min-h-screen flex-col items-center justify-center px-6">
      <Logo className="mb-10" />
      <p className="section-eyebrow">404</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button variant="accent" asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
