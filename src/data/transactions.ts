/**
 * transactions.ts — 6 months of transaction history (Jan–Jun 2026)
 * -----------------------------------------------------------------
 * Vanguard Digital LLC is a web-development agency (the operating company).
 * Vanguard Holdings LLC is the investment holding company that owns it and
 * carries the acquisition term loan.
 *
 * The ledger below is the single source of truth for the demo story:
 *   - Revenue is lumpy and project-based (milestone billing) plus a few
 *     steady monthly retainers.
 *   - Costs are a predictable monthly base (contractor payroll, SaaS, office,
 *     insurance, intercompany management fee) with quarterly and annual spikes
 *     (estimated taxes, E&O, the April audit, domain renewals).
 *   - Three deliberately planted anomalies exercise the anomaly-detection UI.
 *
 * Other data files (forecast, covenants, reconciliation, close checklist) are
 * modelled to be consistent with the patterns and totals produced here.
 */

export type Entity = "digital_llc" | "holdings_llc";

export type RecurrenceType = "monthly" | "quarterly" | "annual" | "one-time";

export type TransactionDirection = "inflow" | "outflow";

export type TransactionCategory =
  | "project_revenue"
  | "retainer_revenue"
  | "contractor_payroll"
  | "software_saas"
  | "office_rent"
  | "insurance"
  | "taxes"
  | "professional_services"
  | "hosting_domains"
  | "intercompany_fee"
  | "debt_service";

export type CounterpartyType =
  | "client"
  | "vendor"
  | "government"
  | "affiliate"
  | "lender";

export type AnomalyType = "double_charge" | "price_increase" | "late_invoice";

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  counterparty: string; // client or vendor name
  counterpartyType: CounterpartyType;
  direction: TransactionDirection;
  amount: number; // always positive; `direction` carries the sign
  category: TransactionCategory;
  entity: Entity;
  recurrence_type: RecurrenceType;
  confidence_score: number; // 0–1 auto-categorization confidence
  note?: string;
  anomaly?: AnomalyType;
}

type RawTransaction = Omit<Transaction, "id">;

/* ------------------------------------------------------------------ *
 * Month scaffolding
 * ------------------------------------------------------------------ */

interface MonthSpec {
  ym: string; // "2026-01"
  lastDay: string; // day-of-month for month-end postings
  adobe: number; // Adobe seat cost (rises mid-year — see anomaly)
  aws: number; // usage-based, drifts up over time
  payrollRun: number; // each of two semi-monthly contractor runs
  interest: number; // Holdings term-loan interest (ties to covenants.ts)
}

const MONTHS: MonthSpec[] = [
  { ym: "2026-01", lastDay: "31", adobe: 1400, aws: 4800, payrollRun: 42000, interest: 9000 },
  { ym: "2026-02", lastDay: "28", adobe: 1400, aws: 5100, payrollRun: 42500, interest: 9200 },
  { ym: "2026-03", lastDay: "31", adobe: 1400, aws: 4950, payrollRun: 43000, interest: 9400 },
  { ym: "2026-04", lastDay: "30", adobe: 1820, aws: 5300, payrollRun: 44000, interest: 9800 },
  { ym: "2026-05", lastDay: "31", adobe: 1820, aws: 5150, payrollRun: 45000, interest: 10100 },
  { ym: "2026-06", lastDay: "30", adobe: 1820, aws: 5400, payrollRun: 44250, interest: 10600 },
];

const RETAINERS = [
  { client: "Atlas Fintech", amount: 12000 },
  { client: "Vertex SaaS Group", amount: 15000 },
  { client: "Lumen Media", amount: 8000 },
];

const raw: RawTransaction[] = [];

/* ------------------------------------------------------------------ *
 * Recurring monthly activity (generated to stay DRY and consistent)
 * ------------------------------------------------------------------ */

for (const m of MONTHS) {
  const { ym, lastDay } = m;

  // --- Monthly retainer revenue (steady, high-confidence) ---
  for (const r of RETAINERS) {
    raw.push({
      date: `${ym}-05`,
      counterparty: r.client,
      counterpartyType: "client",
      direction: "inflow",
      amount: r.amount,
      category: "retainer_revenue",
      entity: "digital_llc",
      recurrence_type: "monthly",
      confidence_score: 0.98,
    });
  }

  // --- Contractor payroll: two semi-monthly runs (~$85K/mo) ---
  for (const day of ["15", lastDay]) {
    raw.push({
      date: `${ym}-${day}`,
      counterparty: "Gusto (Contractor Payroll)",
      counterpartyType: "vendor",
      direction: "outflow",
      amount: m.payrollRun,
      category: "contractor_payroll",
      entity: "digital_llc",
      recurrence_type: "monthly",
      confidence_score: 0.98,
    });
  }

  // --- SaaS stack (~$8K/mo) ---
  const isAdobeIncreaseMonth = ym === "2026-04"; // first month of the price jump
  raw.push({
    date: `${ym}-03`,
    counterparty: "Adobe Creative Cloud",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: m.adobe,
    category: "software_saas",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: isAdobeIncreaseMonth ? 0.72 : 0.97,
    ...(isAdobeIncreaseMonth
      ? {
          anomaly: "price_increase" as const,
          note: "Adobe Creative Cloud increased ~30% ($1,400 → $1,820). Verify contract/seat change before approving as recurring.",
        }
      : {}),
  });
  raw.push({
    date: `${ym}-05`,
    counterparty: "Figma",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: 880,
    category: "software_saas",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: 0.97,
  });
  raw.push({
    date: `${ym}-07`,
    counterparty: "Slack",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: 640,
    category: "software_saas",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: 0.97,
  });
  raw.push({
    date: `${ym}-02`,
    counterparty: "Amazon Web Services",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: m.aws,
    category: "software_saas",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: 0.96,
  });

  // --- Office / coworking ($3,200/mo) ---
  raw.push({
    date: `${ym}-01`,
    counterparty: "WorkHaus Coworking",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: 3200,
    category: "office_rent",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: 0.99,
  });

  // --- General liability insurance ($2,400/mo) ---
  raw.push({
    date: `${ym}-10`,
    counterparty: "Pillar Insurance (General Liability)",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: 2400,
    category: "insurance",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: 0.98,
  });

  // --- Intercompany management fee: Digital pays Holdings ($12,000/mo) ---
  raw.push({
    date: `${ym}-${lastDay}`,
    counterparty: "Vanguard Holdings LLC (Mgmt Fee)",
    counterpartyType: "affiliate",
    direction: "outflow",
    amount: 12000,
    category: "intercompany_fee",
    entity: "digital_llc",
    recurrence_type: "monthly",
    confidence_score: 0.99,
    note: "Intercompany management fee to parent — eliminates on consolidation.",
  });
  // ...and the mirror on the Holdings side (income)
  raw.push({
    date: `${ym}-${lastDay}`,
    counterparty: "Vanguard Digital LLC (Mgmt Fee)",
    counterpartyType: "affiliate",
    direction: "inflow",
    amount: 12000,
    category: "intercompany_fee",
    entity: "holdings_llc",
    recurrence_type: "monthly",
    confidence_score: 0.99,
    note: "Intercompany management fee from operating subsidiary.",
  });

  // --- Holdings term-loan interest (acquisition debt service) ---
  raw.push({
    date: `${ym}-${lastDay}`,
    counterparty: "First Meridian Bank (Term Loan)",
    counterpartyType: "lender",
    direction: "outflow",
    amount: m.interest,
    category: "debt_service",
    entity: "holdings_llc",
    recurrence_type: "monthly",
    confidence_score: 0.99,
    note: "Interest on acquisition term loan. Feeds interest-coverage covenant.",
  });
}

/* ------------------------------------------------------------------ *
 * Project milestone revenue (lumpy, project-based)
 * 8–12 active projects, $15K–$180K each, billed on milestones.
 * ------------------------------------------------------------------ */

const milestones: Array<[string, string, number, string]> = [
  // [client, date, amount, note]
  ["Meridian Health", "2026-01-08", 54000, "Website redesign — 30% kickoff milestone (of $180K)"],
  ["Northwind Logistics", "2026-01-22", 38000, "Carrier portal — milestone 1 (of $95K)"],
  ["Copper & Vine", "2026-01-15", 22500, "Restaurant group site — milestone 1 (of $45K)"],
  ["Sterling Manufacturing", "2026-02-10", 48000, "B2B ordering portal — milestone 1 (of $120K)"],
  ["Peak Outdoor Co", "2026-02-18", 30000, "E-commerce replatform — milestone 1 (of $75K)"],
  ["Copper & Vine", "2026-02-14", 22500, "Restaurant group site — final milestone"],
  ["Harbor Nonprofit", "2026-02-24", 15000, "Donation microsite — fixed fee"],
  ["Meridian Health", "2026-03-09", 54000, "Website redesign — 30% build milestone"],
  ["Northwind Logistics", "2026-03-20", 57000, "Carrier portal — milestone 2 / final"],
  ["Brightpath Education", "2026-03-25", 30000, "LMS front-end — milestone 1 (of $60K)"],
  ["Sterling Manufacturing", "2026-04-13", 36000, "B2B ordering portal — milestone 2"],
  ["Peak Outdoor Co", "2026-04-21", 45000, "E-commerce replatform — final milestone"],
  ["Quill Publishing", "2026-04-28", 19000, "Catalog site — milestone 1 (of $38K)"],
  ["Meridian Health", "2026-05-11", 72000, "Website redesign — 40% launch milestone"],
  ["Brightpath Education", "2026-05-19", 30000, "LMS front-end — final milestone"],
  ["Coastal Realty Group", "2026-05-27", 28000, "Listings site — fixed fee"],
  ["Sterling Manufacturing", "2026-06-15", 36000, "B2B ordering portal — final milestone"],
  ["Quill Publishing", "2026-06-24", 19000, "Catalog site — final milestone"],
];

for (const [client, date, amount, note] of milestones) {
  raw.push({
    date,
    counterparty: client,
    counterpartyType: "client",
    direction: "inflow",
    amount,
    category: "project_revenue",
    entity: "digital_llc",
    recurrence_type: "one-time",
    confidence_score: 0.94,
    note,
  });
}

/* ------------------------------------------------------------------ *
 * Quarterly costs
 * ------------------------------------------------------------------ */

// Estimated tax payments (~$18K, quarterly: Q4'25, Q1'26, Q2'26 due dates)
for (const date of ["2026-01-15", "2026-04-15", "2026-06-16"]) {
  raw.push({
    date,
    counterparty: "US Treasury / State — Estimated Tax",
    counterpartyType: "government",
    direction: "outflow",
    amount: 18000,
    category: "taxes",
    entity: "digital_llc",
    recurrence_type: "quarterly",
    confidence_score: 0.96,
  });
}

// Accounting / legal retainer (~$6K, quarterly)
for (const date of ["2026-03-12", "2026-06-12"]) {
  raw.push({
    date,
    counterparty: "Hollis & Barrow CPA",
    counterpartyType: "vendor",
    direction: "outflow",
    amount: 6000,
    category: "professional_services",
    entity: "digital_llc",
    recurrence_type: "quarterly",
    confidence_score: 0.93,
  });
}

/* ------------------------------------------------------------------ *
 * Annual costs
 * ------------------------------------------------------------------ */

raw.push({
  date: "2026-02-20",
  counterparty: "Cloudflare (Domains & Hosting)",
  counterpartyType: "vendor",
  direction: "outflow",
  amount: 4800,
  category: "hosting_domains",
  entity: "digital_llc",
  recurrence_type: "annual",
  confidence_score: 0.95,
  note: "Annual domain portfolio + hosting renewal.",
});

raw.push({
  date: "2026-03-05",
  counterparty: "Hiscox (E&O Insurance)",
  counterpartyType: "vendor",
  direction: "outflow",
  amount: 14400,
  category: "insurance",
  entity: "digital_llc",
  recurrence_type: "annual",
  confidence_score: 0.95,
  note: "Annual professional liability (E&O) premium.",
});

raw.push({
  date: "2026-04-15",
  counterparty: "Hollis & Barrow CPA (Annual Audit)",
  counterpartyType: "vendor",
  direction: "outflow",
  amount: 22000,
  category: "professional_services",
  entity: "digital_llc",
  recurrence_type: "annual",
  confidence_score: 0.95,
  note: "Annual financial statement audit. Large, predictable April cash draw — drives the mid-April forecast dip.",
});

/* ------------------------------------------------------------------ *
 * Planted anomalies (2–3)
 * ------------------------------------------------------------------ */

// 1) Double charge — AWS billed twice in May (original on the 2nd).
raw.push({
  date: "2026-05-04",
  counterparty: "Amazon Web Services",
  counterpartyType: "vendor",
  direction: "outflow",
  amount: 5150,
  category: "software_saas",
  entity: "digital_llc",
  recurrence_type: "one-time",
  confidence_score: 0.58,
  anomaly: "double_charge",
  note: "Possible duplicate of the 2026-05-02 AWS invoice (identical amount). Pending vendor credit — do not double-count in forecast.",
});

// 2) Price increase — handled inline on the April Adobe line above.

// 3) Late contractor invoice from a prior month.
raw.push({
  date: "2026-05-12",
  counterparty: "Meridian Dev Collective (Contractor)",
  counterpartyType: "vendor",
  direction: "outflow",
  amount: 7800,
  category: "contractor_payroll",
  entity: "digital_llc",
  recurrence_type: "one-time",
  confidence_score: 0.65,
  anomaly: "late_invoice",
  note: "Late invoice for April engagement, received in May. Belongs to prior-period accrual — flag for close review.",
});

/* ------------------------------------------------------------------ *
 * Finalize: sort chronologically and assign stable ids
 * ------------------------------------------------------------------ */

raw.sort((a, b) =>
  a.date < b.date ? -1 : a.date > b.date ? 1 : a.category.localeCompare(b.category)
);

export const transactions: Transaction[] = raw.map((t, i) => ({
  id: `TX-2026-${String(i + 1).padStart(3, "0")}`,
  ...t,
}));

/* ------------------------------------------------------------------ *
 * Derived aggregates (used by dashboard tiles and charts)
 * ------------------------------------------------------------------ */

export interface MonthlySummary {
  period: string; // "2026-01"
  label: string; // "Jan 2026"
  inflows: number;
  outflows: number;
  net: number;
  transactionCount: number;
}

const MONTH_LABELS: Record<string, string> = {
  "2026-01": "Jan 2026",
  "2026-02": "Feb 2026",
  "2026-03": "Mar 2026",
  "2026-04": "Apr 2026",
  "2026-05": "May 2026",
  "2026-06": "Jun 2026",
};

export const monthlySummary: MonthlySummary[] = MONTHS.map(({ ym }) => {
  const rows = transactions.filter((t) => t.date.startsWith(ym));
  const inflows = rows
    .filter((t) => t.direction === "inflow")
    .reduce((s, t) => s + t.amount, 0);
  const outflows = rows
    .filter((t) => t.direction === "outflow")
    .reduce((s, t) => s + t.amount, 0);
  return {
    period: ym,
    label: MONTH_LABELS[ym],
    inflows,
    outflows,
    net: inflows - outflows,
    transactionCount: rows.length,
  };
});

export const anomalies: Transaction[] = transactions.filter((t) => t.anomaly);

export const transactionsSummary = {
  entity: "Vanguard Digital LLC (consolidated with Vanguard Holdings LLC)",
  periodStart: "2026-01-01",
  periodEnd: "2026-06-30",
  count: transactions.length,
  totalInflows: transactions
    .filter((t) => t.direction === "inflow")
    .reduce((s, t) => s + t.amount, 0),
  totalOutflows: transactions
    .filter((t) => t.direction === "outflow")
    .reduce((s, t) => s + t.amount, 0),
  anomalyCount: anomalies.length,
};
