/**
 * Shared chart tokens so every visualization reads as one system.
 * Values mirror the brand palette in tailwind.config.ts / globals.css.
 */
export const chartColors = {
  blue: "#60A5FA", // blue-400 — primary data hue
  indigo: "#818CF8", // gradient partner
  green: "#4ADE80", // green-400 — complete / positive
  amber: "#FBBF24", // amber-400 — warning
  red: "#F87171", // red-400 — danger / covenant floor
  slate600: "#475569", // recessive "remaining" track
  slate500: "#64748B", // muted text / zero baseline
  slate400: "#94A3B8", // axis labels
  grid: "#334155", // slate-700 gridlines
  surface: "#0F172A", // page background
} as const;

/**
 * Categorical colors for the three covenant ratios. CVD-validated triad
 * (sky / violet / orange) — distinct from the reserved green/amber/red
 * status colors. Always paired with a legend + direct end-labels.
 */
export const covenantColors: Record<string, string> = {
  current_ratio: "#38BDF8", // sky-400
  debt_to_equity: "#A78BFA", // violet-400
  interest_coverage: "#FB923C", // orange-400
};

/** Recharts tooltip container styling (dark, on-brand). */
export const tooltipStyle = {
  backgroundColor: "#1E293B",
  border: "1px solid #334155",
  borderRadius: "0.5rem",
  color: "#CBD5E1",
  fontSize: "0.75rem",
  fontFamily: "var(--font-nunito), sans-serif",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
} as const;

export const axisTick = {
  fill: chartColors.slate400,
  fontSize: 11,
  fontFamily: "var(--font-nunito), sans-serif",
} as const;
