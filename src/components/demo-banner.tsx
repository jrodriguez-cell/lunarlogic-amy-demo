import { demoClient } from "@/data/client";

/**
 * Subtle blue-tinted banner marking this as a non-production demo.
 */
export function DemoBanner() {
  return (
    <div className="w-full border-b border-blue-400/20 bg-blue-400/10 px-4 py-1.5 text-center text-xs font-medium tracking-wide text-blue-200">
      {demoClient.environmentLabel} — {demoClient.name}
    </div>
  );
}
