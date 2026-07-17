/**
 * covenants.ts — debt covenant monitoring (Vanguard Holdings LLC facility)
 * -----------------------------------------------------------------------
 * The acquisition term loan from First Meridian Bank carries three
 * maintenance covenants tested monthly on a consolidated basis.
 *
 * Story: liquidity (current ratio) and leverage (debt-to-equity) are healthy
 * and stable, but interest coverage is being squeezed from both sides —
 * rising interest expense as the facility's rate resets (the climbing
 * `debt_service` interest in transactions.ts: $9,000 in Jan → $10,600 in Jun)
 * and compressed EBITDA from the lumpy summer revenue trough. The forward
 * projection breaks the 2.0x floor in September 2026 — the early-warning case
 * the What-If panel then shows AR acceleration can avert.
 *
 * Interest-expense figures reconcile to the Holdings-entity `debt_service`
 * transactions for Jan–Jun.
 */

export type CovenantOperator = ">=" | "<=";
export type PointType = "actual" | "projected";

export interface CovenantDefinition {
  key: "current_ratio" | "debt_to_equity" | "interest_coverage";
  label: string;
  formula: string;
  operator: CovenantOperator;
  threshold: number;
  unit: string;
  description: string;
}

export const covenantDefinitions: CovenantDefinition[] = [
  {
    key: "current_ratio",
    label: "Current Ratio",
    formula: "Current Assets ÷ Current Liabilities",
    operator: ">=",
    threshold: 1.5,
    unit: "x",
    description: "Liquidity floor — near-term assets vs. near-term obligations.",
  },
  {
    key: "debt_to_equity",
    label: "Debt-to-Equity",
    formula: "Total Debt ÷ Total Equity",
    operator: "<=",
    threshold: 3.0,
    unit: "x",
    description: "Leverage ceiling on the consolidated balance sheet.",
  },
  {
    key: "interest_coverage",
    label: "Interest Coverage",
    formula: "EBITDA ÷ Interest Expense",
    operator: ">=",
    threshold: 2.0,
    unit: "x",
    description: "Debt-service cushion — earnings vs. facility interest.",
  },
];

export interface CovenantPoint {
  period: string; // "2026-01"
  label: string; // "Jan"
  monthIndex: number; // 1 = Jan 2026
  type: PointType;

  // Underlying components (so charts can show the drivers, not just ratios)
  currentAssets: number;
  currentLiabilities: number;
  totalDebt: number;
  totalEquity: number;
  ebitda: number;
  interestExpense: number;

  // Covenant ratios (rounded to 2dp)
  current_ratio: number;
  debt_to_equity: number;
  interest_coverage: number;
}

type RawPoint = Omit<
  CovenantPoint,
  "current_ratio" | "debt_to_equity" | "interest_coverage"
>;

const rawPoints: RawPoint[] = [
  // ---- Actuals (Jan–Jun 2026) ----
  // Interest coverage declines 3.10x → 2.31x; current ratio ~stable near 1.8x;
  // debt-to-equity edges up 2.28x → 2.41x.
  { period: "2026-01", label: "Jan", monthIndex: 1, type: "actual", currentAssets: 379250, currentLiabilities: 205000, totalDebt: 1197000, totalEquity: 525000, ebitda: 27900, interestExpense: 9000 },
  { period: "2026-02", label: "Feb", monthIndex: 2, type: "actual", currentAssets: 384300, currentLiabilities: 210000, totalDebt: 1210440, totalEquity: 524000, ebitda: 27140, interestExpense: 9200 },
  { period: "2026-03", label: "Mar", monthIndex: 3, type: "actual", currentAssets: 379760, currentLiabilities: 202000, totalDebt: 1214400, totalEquity: 528000, ebitda: 26320, interestExpense: 9400 },
  { period: "2026-04", label: "Apr", monthIndex: 4, type: "actual", currentAssets: 390220, currentLiabilities: 218000, totalDebt: 1222480, totalEquity: 518000, ebitda: 25676, interestExpense: 9800 },
  { period: "2026-05", label: "May", monthIndex: 5, type: "actual", currentAssets: 386400, currentLiabilities: 210000, totalDebt: 1239980, totalEquity: 521000, ebitda: 25048, interestExpense: 10100 },
  { period: "2026-06", label: "Jun", monthIndex: 6, type: "actual", currentAssets: 393120, currentLiabilities: 216000, totalDebt: 1241150, totalEquity: 515000, ebitda: 24486, interestExpense: 10600 },
  // ---- Projected (Jul–Sep 2026) — interest coverage breaks 2.0x in Sep ----
  { period: "2026-07", label: "Jul", monthIndex: 7, type: "projected", currentAssets: 399600, currentLiabilities: 222000, totalDebt: 1254400, totalEquity: 512000, ebitda: 23980, interestExpense: 11000 },
  { period: "2026-08", label: "Aug", monthIndex: 8, type: "projected", currentAssets: 405840, currentLiabilities: 228000, totalDebt: 1270000, totalEquity: 508000, ebitda: 23484, interestExpense: 11400 },
  { period: "2026-09", label: "Sep", monthIndex: 9, type: "projected", currentAssets: 402750, currentLiabilities: 225000, totalDebt: 1290300, totalEquity: 510000, ebitda: 21728, interestExpense: 11200 },
];

const round2 = (n: number) => Number(n.toFixed(2));

export const covenantHistory: CovenantPoint[] = rawPoints.map((p) => ({
  ...p,
  current_ratio: round2(p.currentAssets / p.currentLiabilities),
  debt_to_equity: round2(p.totalDebt / p.totalEquity),
  interest_coverage: round2(p.ebitda / p.interestExpense),
}));

/* ------------------------------------------------------------------ *
 * Month-name helpers
 * ------------------------------------------------------------------ */

function monthName(period: string | undefined, long = false): string | undefined {
  if (!period) return undefined;
  return new Date(`${period}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: long ? "long" : "short",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ *
 * Status, headroom, trend & breach detection
 * ------------------------------------------------------------------ */

export type CovenantState = "compliant" | "watch" | "breach";
export type TrendDirection = "up" | "down" | "flat";

export interface CovenantTrend {
  direction: TrendDirection;
  label: string;
}

export interface CovenantStatus {
  key: CovenantDefinition["key"];
  label: string;
  formula: string;
  threshold: number;
  operator: CovenantOperator;
  unit: string;
  latestActual: number; // most recent actual (Jun 2026)
  headroomPct: number; // cushion vs threshold (+ = compliant)
  state: CovenantState;
  trend: CovenantTrend;
  breachPeriod?: string; // first projected period that breaks the covenant
  breachValue?: number;
  breachMonth?: string; // "September"
  narrative: string;
  alert?: string;
}

function trendFor(values: number[]): CovenantTrend {
  const first = values[0];
  const last = values[values.length - 1];
  const pct = ((last - first) / first) * 100;
  if (Math.abs(pct) < 3) return { direction: "flat", label: "Stable" };
  if (pct > 0)
    return { direction: "up", label: pct > 12 ? "Increasing" : "Slight increase" };
  return { direction: "down", label: pct < -12 ? "Declining" : "Slight decline" };
}

const narrativeByKey: Record<CovenantDefinition["key"], string> = {
  current_ratio:
    "Liquidity holds comfortably above the 1.5x floor across the forecast — stable through the summer billing trough.",
  debt_to_equity:
    "Leverage is edging up as the term loan amortizes slowly against roughly flat equity, but stays well under the 3.0x cap.",
  interest_coverage:
    "Coverage is compressing as facility interest climbs and summer EBITDA softens. It remains compliant today but is trending toward the floor.",
};

function evaluate(def: CovenantDefinition): CovenantStatus {
  const actuals = covenantHistory.filter((p) => p.type === "actual");
  const series = covenantHistory.map((p) => ({
    type: p.type,
    period: p.period,
    value: p[def.key] as number,
  }));

  const latest = actuals[actuals.length - 1][def.key] as number;
  const passes = (v: number) =>
    def.operator === ">=" ? v >= def.threshold : v <= def.threshold;

  const firstBreach = series.find((s) => s.type === "projected" && !passes(s.value));
  const currentlyFails = !passes(latest);

  const headroomPct =
    def.operator === ">="
      ? round2(((latest - def.threshold) / def.threshold) * 100)
      : round2(((def.threshold - latest) / def.threshold) * 100);

  let state: CovenantState = "compliant";
  if (currentlyFails) state = "breach";
  else if (firstBreach || headroomPct < 15) state = "watch";

  return {
    key: def.key,
    label: def.label,
    formula: def.formula,
    threshold: def.threshold,
    operator: def.operator,
    unit: def.unit,
    latestActual: latest,
    headroomPct,
    state,
    trend: trendFor(actuals.map((p) => p[def.key] as number)),
    breachPeriod: firstBreach?.period,
    breachValue: firstBreach?.value,
    breachMonth: monthName(firstBreach?.period, true),
    narrative: narrativeByKey[def.key],
    alert: firstBreach
      ? `At current trajectory, projected to breach the ${def.threshold.toFixed(1)}x minimum in ${monthName(firstBreach.period, true)} 2026.`
      : undefined,
  };
}

export const covenantStatuses: CovenantStatus[] = covenantDefinitions.map(evaluate);

/* ------------------------------------------------------------------ *
 * Aggregate health (dashboard "Covenant Health" card + alert)
 * ------------------------------------------------------------------ */

export type HealthLevel = "green" | "amber" | "red";

const tightest: CovenantStatus =
  covenantStatuses.find((s) => s.breachPeriod) ??
  [...covenantStatuses].sort((a, b) => a.headroomPct - b.headroomPct)[0];

function overallLevel(): HealthLevel {
  if (covenantStatuses.some((s) => s.state === "breach")) return "red";
  if (covenantStatuses.some((s) => s.state === "watch")) return "amber";
  return "green";
}

export const covenantHealth = {
  level: overallLevel(),
  tightest,
  label: tightest.label,
  currentValue: tightest.latestActual,
  threshold: tightest.threshold,
  operator: tightest.operator,
  unit: tightest.unit,
  breachPeriod: tightest.breachPeriod,
  breachValue: tightest.breachValue,
  breachMonth: tightest.breachMonth, // "September"
  breachMonthShort: monthName(tightest.breachPeriod), // "Sep"
};

export const covenantAlert = {
  hasEarlyWarning: covenantStatuses.some((s) => s.breachPeriod),
  breachedCovenant: covenantStatuses.find((s) => s.breachPeriod),
};

/** Interest-coverage series for the dashboard covenant-alert trend chart. */
export const interestCoverageSeries = covenantHistory.map((p) => ({
  period: p.period,
  label: p.label,
  type: p.type,
  value: p.interest_coverage,
}));

export const interestCoverageThreshold =
  covenantDefinitions.find((d) => d.key === "interest_coverage")!.threshold;

/* ------------------------------------------------------------------ *
 * What-If scenario model
 * ------------------------------------------------------------------ *
 * Faster AR collection (lower DSO) frees cash to pay down the revolver —
 * cutting interest and lifting coverage — and lifts liquidity; higher revenue
 * lifts EBITDA. Both improve the projected covenant path. This is a
 * transparent linear model over the projected months only (actuals are
 * untouched). At (0 days, 0%) it returns the baseline projection.
 */

export interface ScenarioPoint {
  period: string;
  label: string;
  type: PointType;
  current_ratio: number;
  debt_to_equity: number;
  interest_coverage: number;
}

export interface ScenarioResult {
  points: ScenarioPoint[];
  /** Projected September interest coverage under the scenario. */
  projectedInterestCoverage: number;
  baselineInterestCoverage: number;
  breachAverted: boolean;
}

export const scenarioLimits = {
  dsoDaysMax: 30,
  revenuePctMax: 25,
};

export function projectScenario(dsoDays: number, revPct: number): ScenarioResult {
  const icFactor = 1 + dsoDays * 0.005 + (revPct / 100) * 0.6;
  const crFactor = 1 + dsoDays * 0.003 + (revPct / 100) * 0.35;
  const deFactor = 1 - (dsoDays * 0.002 + (revPct / 100) * 0.25);

  const points: ScenarioPoint[] = covenantHistory.map((p) => {
    if (p.type === "actual") {
      return {
        period: p.period,
        label: p.label,
        type: p.type,
        current_ratio: p.current_ratio,
        debt_to_equity: p.debt_to_equity,
        interest_coverage: p.interest_coverage,
      };
    }
    return {
      period: p.period,
      label: p.label,
      type: p.type,
      current_ratio: round2(p.current_ratio * crFactor),
      debt_to_equity: round2(p.debt_to_equity * deFactor),
      interest_coverage: round2(p.interest_coverage * icFactor),
    };
  });

  const sep = points.find((p) => p.period === "2026-09")!;
  const baselineSep = covenantHistory.find((p) => p.period === "2026-09")!
    .interest_coverage;

  return {
    points,
    projectedInterestCoverage: sep.interest_coverage,
    baselineInterestCoverage: baselineSep,
    breachAverted: sep.interest_coverage >= interestCoverageThreshold,
  };
}
