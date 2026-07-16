/**
 * covenants.ts — debt covenant monitoring (Vanguard Holdings LLC facility)
 * -----------------------------------------------------------------------
 * The acquisition term loan from First Meridian Bank carries three
 * maintenance covenants tested monthly on a consolidated basis.
 *
 * Story: the business is healthy on liquidity (current ratio) and leverage
 * (debt-to-equity stays under the cap), but interest coverage is being
 * squeezed from both sides — rising interest expense as the facility's rate
 * resets (see the climbing `debt_service` interest in transactions.ts:
 * $9,000 in Jan → $10,600 in Jun) and compressed EBIT from the lumpy summer
 * revenue trough plus higher contractor costs. The forward projection breaks
 * the 2.0x floor in Month 8 (August 2026) — the early-warning scenario.
 *
 * Interest-expense figures below reconcile to the Holdings-entity
 * `debt_service` transactions for Jan–Jun.
 */

export type CovenantOperator = ">=" | "<=";
export type PointType = "actual" | "projected";

export interface CovenantDefinition {
  key: "current_ratio" | "debt_to_equity" | "interest_coverage";
  label: string;
  operator: CovenantOperator;
  threshold: number;
  unit: string;
  description: string;
}

export const covenantDefinitions: CovenantDefinition[] = [
  {
    key: "current_ratio",
    label: "Current Ratio",
    operator: ">=",
    threshold: 1.5,
    unit: "x",
    description: "Current assets ÷ current liabilities. Liquidity floor.",
  },
  {
    key: "debt_to_equity",
    label: "Debt-to-Equity",
    operator: "<=",
    threshold: 3.0,
    unit: "x",
    description: "Total debt ÷ total equity. Leverage ceiling.",
  },
  {
    key: "interest_coverage",
    label: "Interest Coverage",
    operator: ">=",
    threshold: 2.0,
    unit: "x",
    description: "EBIT ÷ interest expense. Debt-service cushion.",
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
  ebit: number;
  interestExpense: number;

  // Covenant ratios (rounded to 2dp)
  current_ratio: number;
  debt_to_equity: number;
  interest_coverage: number;
}

interface RawPoint {
  period: string;
  label: string;
  monthIndex: number;
  type: PointType;
  currentAssets: number;
  currentLiabilities: number;
  totalDebt: number;
  totalEquity: number;
  ebit: number;
  interestExpense: number;
}

const rawPoints: RawPoint[] = [
  // ---- Actuals (Jan–Jun 2026) ----
  { period: "2026-01", label: "Jan", monthIndex: 1, type: "actual", currentAssets: 382200, currentLiabilities: 182000, totalDebt: 1222000, totalEquity: 520000, ebit: 34200, interestExpense: 9000 },
  { period: "2026-02", label: "Feb", monthIndex: 2, type: "actual", currentAssets: 385400, currentLiabilities: 188000, totalDebt: 1252800, totalEquity: 522000, ebit: 33120, interestExpense: 9200 },
  { period: "2026-03", label: "Mar", monthIndex: 3, type: "actual", currentAssets: 390220, currentLiabilities: 179000, totalDebt: 1256640, totalEquity: 528000, ebit: 31960, interestExpense: 9400 },
  { period: "2026-04", label: "Apr", monthIndex: 4, type: "actual", currentAssets: 393600, currentLiabilities: 205000, totalDebt: 1313250, totalEquity: 515000, ebit: 28420, interestExpense: 9800 },
  { period: "2026-05", label: "May", monthIndex: 5, type: "actual", currentAssets: 397980, currentLiabilities: 198000, totalDebt: 1320480, totalEquity: 524000, ebit: 27270, interestExpense: 10100 },
  { period: "2026-06", label: "Jun", monthIndex: 6, type: "actual", currentAssets: 395160, currentLiabilities: 222000, totalDebt: 1372160, totalEquity: 512000, ebit: 25440, interestExpense: 10600 },
  // ---- Projected (Jul–Sep 2026, from the forecast) ----
  { period: "2026-07", label: "Jul", monthIndex: 7, type: "projected", currentAssets: 392160, currentLiabilities: 228000, totalDebt: 1391920, totalEquity: 508000, ebit: 24200, interestExpense: 11000 },
  { period: "2026-08", label: "Aug", monthIndex: 8, type: "projected", currentAssets: 391760, currentLiabilities: 236000, totalDebt: 1430700, totalEquity: 502000, ebit: 21660, interestExpense: 11400 },
  { period: "2026-09", label: "Sep", monthIndex: 9, type: "projected", currentAssets: 392700, currentLiabilities: 231000, totalDebt: 1416800, totalEquity: 506000, ebit: 23520, interestExpense: 11200 },
];

const round2 = (n: number) => Number(n.toFixed(2));

export const covenantHistory: CovenantPoint[] = rawPoints.map((p) => ({
  ...p,
  current_ratio: round2(p.currentAssets / p.currentLiabilities),
  debt_to_equity: round2(p.totalDebt / p.totalEquity),
  interest_coverage: round2(p.ebit / p.interestExpense),
}));

/* ------------------------------------------------------------------ *
 * Breach detection & early warning
 * ------------------------------------------------------------------ */

export interface CovenantStatus {
  key: CovenantDefinition["key"];
  label: string;
  threshold: number;
  operator: CovenantOperator;
  unit: string;
  latestActual: number; // most recent actual (Jun 2026)
  headroomPct: number; // cushion vs threshold, signed (+ = compliant)
  status: "compliant" | "watch" | "projected_breach";
  breachPeriod?: string; // first projected period that breaks the covenant
  breachValue?: number;
  narrative: string;
}

function evaluate(def: CovenantDefinition): CovenantStatus {
  const series = covenantHistory.map((p) => ({
    period: p.period,
    type: p.type,
    value: p[def.key] as number,
  }));

  const latestActual = [...series].reverse().find((s) => s.type === "actual")!;
  const passes = (v: number) =>
    def.operator === ">=" ? v >= def.threshold : v <= def.threshold;

  const firstBreach = series.find((s) => s.type === "projected" && !passes(s.value));

  const headroomPct =
    def.operator === ">="
      ? round2(((latestActual.value - def.threshold) / def.threshold) * 100)
      : round2(((def.threshold - latestActual.value) / def.threshold) * 100);

  let status: CovenantStatus["status"] = "compliant";
  if (firstBreach) status = "projected_breach";
  else if (headroomPct < 20) status = "watch";

  const narrativeByKey: Record<CovenantDefinition["key"], string> = {
    current_ratio:
      "Liquidity remains above the 1.5x floor across the forecast horizon. Lumpy June/summer billing narrows headroom but does not breach.",
    debt_to_equity:
      "Leverage stays under the 3.0x cap but is tightening as the term loan amortizes slowly against roughly flat equity. Monitor if a distribution is contemplated.",
    interest_coverage:
      "EARLY WARNING: coverage is compressing as facility interest rises and summer EBIT softens. Projected to fall to 1.9x in August 2026 — below the 2.0x floor. Recommend accelerating AR collection on the Meridian and Sterling milestones and deferring discretionary spend into Q4, or a partial principal paydown to relieve interest.",
  };

  return {
    key: def.key,
    label: def.label,
    threshold: def.threshold,
    operator: def.operator,
    unit: def.unit,
    latestActual: latestActual.value,
    headroomPct,
    status,
    breachPeriod: firstBreach?.period,
    breachValue: firstBreach?.value,
    narrative: narrativeByKey[def.key],
  };
}

export const covenantStatuses: CovenantStatus[] = covenantDefinitions.map(evaluate);

export const covenantAlert = {
  hasEarlyWarning: covenantStatuses.some((s) => s.status === "projected_breach"),
  breachedCovenant: covenantStatuses.find((s) => s.status === "projected_breach"),
};
