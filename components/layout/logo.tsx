import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
}

/** Shared Lockin-AI logo mark. */
export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const box = size === "sm" ? "h-6 w-6" : "h-7 w-7";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-foreground/10 bg-foreground text-[10px] font-bold text-background",
          box,
        )}
      >
        L
      </div>
      {showText && (
        <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      )}
    </div>
  );
}
