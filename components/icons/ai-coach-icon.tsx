import Image from "next/image";
import { cn } from "@/lib/utils";

interface AiCoachIconProps {
  className?: string;
}

/** Custom brain-circuit icon for AI Coach. */
export function AiCoachIcon({ className }: AiCoachIconProps) {
  return (
    <span className={cn("relative inline-block shrink-0", className ?? "h-4 w-4")}>
      <Image
        src="/icons/ai-coach.png"
        alt=""
        fill
        sizes="32px"
        className="object-contain dark:invert"
        aria-hidden
      />
    </span>
  );
}
