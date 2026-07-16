/**
 * Headline treasury metrics for the Vanguard Holdings Group demo.
 * Mock data only — no live QuickBooks connection in this environment.
 */
export type Trend = "up" | "down" | "flat";
export type Sentiment = "positive" | "negative" | "neutral";

export interface Metric {
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  /** Whether the movement is good, bad, or neutral for this metric. */
  sentiment: Sentiment;
  hint: string;
}

export const headlineMetrics: Metric[] = [
  {
    label: "Cash on Hand",
    value: "$4.82M",
    delta: "+$310K MoM",
    trend: "up",
    sentiment: "positive",
    hint: "Across 3 operating accounts",
  },
  {
    label: "Days Sales Outstanding",
    value: "41 days",
    delta: "−6 days",
    trend: "down",
    sentiment: "positive",
    hint: "Trailing 90-day average",
  },
  {
    label: "13-Week Net Cash Flow",
    value: "+$1.14M",
    delta: "+$220K vs. plan",
    trend: "up",
    sentiment: "positive",
    hint: "Forecast horizon",
  },
  {
    label: "Covenant Headroom",
    value: "1.9x",
    delta: "DSCR vs. 1.25x min",
    trend: "flat",
    sentiment: "neutral",
    hint: "Senior facility — comfortable",
  },
];
