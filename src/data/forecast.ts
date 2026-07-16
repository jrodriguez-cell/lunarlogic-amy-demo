/**
 * forecast.ts — rolling 4-week direct cash forecast
 * --------------------------------------------------
 * Built from the recurring patterns and dated project milestones in
 * transactions.ts for Vanguard Digital LLC's operating account.
 *
 * Snapshot anchor: Monday 2026-04-06.
 * This anchor is deliberate — it is the window LunarLogic uses to demonstrate
 * predictive value: the forward four weeks contain the $22,000 annual audit
 * fee (2026-04-15) plus the $18,000 Q1 estimated tax payment landing in the
 * same week. A pattern-blind manual forecast built from "typical" weeks would
 * miss that stacked outflow; the system flags the resulting cash dip weeks
 * ahead. The trailing four weeks (built from March) have known actuals, so the
 * forecast-vs-actual accuracy panel compares against real settled cash.
 *
 * All figures are for the Digital LLC operating account only (intercompany
 * management fee to Holdings is included as an outflow; Holdings-side inflows
 * are excluded).
 */

export interface ForecastWeek {
  weekLabel: string; // "Apr 6–12"
  weekStart: string; // ISO date (Monday)
  projected_inflows: number;
  projected_outflows: number;
  net_position: number; // projected end-of-week cash balance
  confidence_band_high: number; // upper bound on end-of-week balance
  confidence_band_low: number; // lower bound on end-of-week balance
  drivers: string[]; // notable items shaping the week
  isCashDip?: boolean;
}

export interface ForecastActualWeek {
  weekLabel: string;
  weekStart: string;
  forecast_net: number; // predicted net cash movement for the week
  actual_net: number; // settled net cash movement
  variance: number; // actual − forecast
  variance_pct: number; // |variance| / |forecast|, as a percentage
  accuracy_pct: number; // 100 − variance_pct
}

/** Cash on hand in the operating account at the snapshot anchor. */
export const openingBalance = 312000;
export const anchorDate = "2026-04-06";

/* ------------------------------------------------------------------ *
 * Forward 4-week forecast
 * ------------------------------------------------------------------ */

export const forecastWeeks: ForecastWeek[] = [
  {
    weekLabel: "Apr 6–12",
    weekStart: "2026-04-06",
    projected_inflows: 24000,
    projected_outflows: 9000,
    net_position: 327000, // 312,000 + 15,000
    confidence_band_high: 335000,
    confidence_band_low: 319000,
    drivers: [
      "Vertex SaaS retainer received ($15K)",
      "GL insurance premium ($2.4K)",
      "No project milestone billed this week",
    ],
  },
  {
    weekLabel: "Apr 13–19",
    weekStart: "2026-04-13",
    projected_inflows: 48000,
    projected_outflows: 84000,
    net_position: 291000, // 327,000 − 36,000  ← predicted dip
    confidence_band_high: 305000,
    confidence_band_low: 277000,
    isCashDip: true,
    drivers: [
      "Sterling Manufacturing milestone ($36K) + Atlas retainer ($12K)",
      "Contractor payroll run ($44K)",
      "ANNUAL AUDIT FEE ($22K) + Q1 estimated tax ($18K) both settle 4/15",
      "System flagged this stacked annual + quarterly outflow 3 weeks out",
    ],
  },
  {
    weekLabel: "Apr 20–26",
    weekStart: "2026-04-20",
    projected_inflows: 53000,
    projected_outflows: 12000,
    net_position: 332000, // 291,000 + 41,000  ← recovery
    confidence_band_high: 352000,
    confidence_band_low: 312000,
    drivers: [
      "Peak Outdoor final milestone ($45K) + Lumen retainer ($8K)",
      "Routine SaaS / vendor settlements",
      "Cash rebuilds after the audit-week trough",
    ],
  },
  {
    weekLabel: "Apr 27–May 3",
    weekStart: "2026-04-27",
    projected_inflows: 19000,
    projected_outflows: 67200,
    net_position: 283800, // 332,000 − 48,200
    confidence_band_high: 312000,
    confidence_band_low: 255000,
    drivers: [
      "Quill Publishing milestone ($19K)",
      "Contractor payroll run ($44.25K)",
      "Month-end intercompany mgmt fee ($12K) + May office rent + SaaS",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Forecast vs. actual — trailing 4 weeks (March, settled)
 * ------------------------------------------------------------------ */

export const forecastVsActual: ForecastActualWeek[] = [
  {
    weekLabel: "Mar 9–15",
    weekStart: "2026-03-09",
    forecast_net: 41000,
    actual_net: 43200, // Meridian milestone landed on schedule
    variance: 2200,
    variance_pct: 5.4,
    accuracy_pct: 94.6,
  },
  {
    weekLabel: "Mar 16–22",
    weekStart: "2026-03-16",
    forecast_net: 34000,
    actual_net: 32450, // Northwind final milestone, minor timing slip
    variance: -1550,
    variance_pct: 4.6,
    accuracy_pct: 95.4,
  },
  {
    weekLabel: "Mar 23–29",
    weekStart: "2026-03-23",
    forecast_net: -6000,
    actual_net: -6820, // E&O timing + Brightpath milestone offset
    variance: -820,
    variance_pct: 13.7,
    accuracy_pct: 86.3,
  },
  {
    weekLabel: "Mar 30–Apr 5",
    weekStart: "2026-03-30",
    forecast_net: -18500,
    actual_net: -17900, // month-end payroll + mgmt fee
    variance: 600,
    variance_pct: 3.2,
    accuracy_pct: 96.8,
  },
];

/* ------------------------------------------------------------------ *
 * Headline accuracy (mean absolute percentage error across the window)
 * ------------------------------------------------------------------ */

export const forecastAccuracy = {
  trailingWeeks: forecastVsActual.length,
  mape_pct: Number(
    (
      forecastVsActual.reduce((s, w) => s + w.variance_pct, 0) /
      forecastVsActual.length
    ).toFixed(1)
  ),
  get accuracy_pct() {
    return Number((100 - this.mape_pct).toFixed(1));
  },
  lowestProjectedBalance: Math.min(...forecastWeeks.map((w) => w.net_position)),
  lowestBalanceWeek:
    forecastWeeks.find((w) => w.isCashDip)?.weekLabel ?? "Apr 13–19",
};

/* ------------------------------------------------------------------ *
 * 8-week cash-flow series (4 settled + 4 projected)
 * Contiguous: the trailing weeks (Mar 9 – Apr 5) run straight into the
 * forward weeks (Apr 6 – May 3). Used by the dashboard cash-flow chart.
 *
 * `net` is the week's net cash movement (inflows − outflows) — it crosses
 * zero, so the audit-week dip reads clearly against a zero baseline. For
 * projected weeks we also carry a widening confidence band derived from the
 * end-of-week balance band in `forecastWeeks`.
 * ------------------------------------------------------------------ */

export interface WeeklyCashPoint {
  weekLabel: string;
  weekStart: string;
  segment: "historical" | "projected";
  net: number; // inflows − outflows for the week
  balance: number; // end-of-week cash balance
  bandLow: number | null; // projected-only lower bound on net
  bandHigh: number | null; // projected-only upper bound on net
  isCashDip?: boolean;
}

// Reconstruct settled end-of-week balances backward from the anchor opening
// balance (which is the closing balance of the last historical week).
const historicalEndBalances: number[] = [];
{
  let bal = openingBalance;
  for (let i = forecastVsActual.length - 1; i >= 0; i--) {
    historicalEndBalances[i] = bal;
    bal -= forecastVsActual[i].actual_net;
  }
}

export const weeklyCashFlow: WeeklyCashPoint[] = [
  ...forecastVsActual.map((w, i) => ({
    weekLabel: w.weekLabel,
    weekStart: w.weekStart,
    segment: "historical" as const,
    net: w.actual_net,
    balance: historicalEndBalances[i],
    bandLow: null,
    bandHigh: null,
  })),
  ...forecastWeeks.map((w) => {
    const net = w.projected_inflows - w.projected_outflows;
    // Half-width of the end-of-week balance band widens with the horizon;
    // reuse it as the uncertainty around the week's net movement.
    const half = (w.confidence_band_high - w.confidence_band_low) / 2;
    return {
      weekLabel: w.weekLabel,
      weekStart: w.weekStart,
      segment: "projected" as const,
      net,
      balance: w.net_position,
      bandLow: net - half,
      bandHigh: net + half,
      isCashDip: w.isCashDip,
    };
  }),
];

/** Net cash movement across the 4 projected weeks (audit-heavy window). */
export const projectedFourWeekNet = forecastWeeks.reduce(
  (s, w) => s + (w.projected_inflows - w.projected_outflows),
  0
);
