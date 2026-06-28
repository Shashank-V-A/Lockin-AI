import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
}

/** Shared Lockin-AI logo mark. */
export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const box = size === "sm" ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground",
          box,
        )}
      >
        L
      </div>
      {showText && (
        <span className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</span>
      )}
    </div>
  );
}
