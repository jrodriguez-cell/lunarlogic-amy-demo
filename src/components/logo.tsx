import { cn } from "@/lib/utils";

/**
 * LunarLogic crescent moon mark rendered with the brand gradient fill.
 * Path + viewBox are fixed per brand spec.
 */
export function LunarLogicMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      role="img"
      aria-label="LunarLogic"
    >
      <defs>
        <linearGradient
          id="ll-crescent-gradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <path
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
        fill="url(#ll-crescent-gradient)"
      />
    </svg>
  );
}

/**
 * Full lockup: crescent mark + "lunarlogic.ai" wordmark.
 * - "lunarlogic" — Nunito Bold 700, brand gradient
 * - ".ai" — Nunito Semibold 600, white at 70% opacity
 */
export function LunarLogicWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LunarLogicMark className="h-7 w-7" />
      <span className="text-xl tracking-tight">
        <span className="brand-gradient-text font-bold">lunarlogic</span>
        <span className="font-semibold text-white/70">.ai</span>
      </span>
    </div>
  );
}
