export type QuickBooksConnectionState =
  | "disconnected"
  | "connected"
  | "reconnect_required";

export type QuickBooksSyncState =
  | "never"
  | "running"
  | "succeeded"
  | "failed";

export interface QuickBooksConnectionSummary {
  legalEntityId: string;
  legalEntityName: string;
  environment: "sandbox" | "production";
  status: QuickBooksConnectionState;
  companyName: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
}

export interface QuickBooksConnectionStatusResponse {
  connection?: QuickBooksConnectionSummary;
  error?: string;
}

export interface QuickBooksLiveMetric {
  label: string;
  value: number | null;
  currency: string;
  provenance: "live" | "unavailable";
  detail: string;
}

export interface QuickBooksLiveReportLine {
  label: string;
  amount: number | null;
  depth: number;
}

export interface QuickBooksLiveReport {
  type:
    | "balance_sheet"
    | "profit_and_loss"
    | "trial_balance"
    | "aged_receivables"
    | "aged_payables";
  name: string;
  basis: string | null;
  currency: string;
  startPeriod: string | null;
  endPeriod: string | null;
  fetchedAt: string;
  lines: QuickBooksLiveReportLine[];
}

export interface QuickBooksLiveOverview {
  connection: {
    status: QuickBooksConnectionState;
    companyName: string | null;
    legalEntityName: string;
    environment: "sandbox" | "production";
  };
  sync: {
    status: QuickBooksSyncState;
    startedAt: string | null;
    finishedAt: string | null;
    recordCounts: {
      accounts: number;
      reports: number;
    } | null;
    warnings: string[];
    errorSummary: string | null;
  };
  metrics: {
    bookCash: QuickBooksLiveMetric;
    openReceivables: QuickBooksLiveMetric;
    openPayables: QuickBooksLiveMetric;
    revenue: QuickBooksLiveMetric;
    expenses: QuickBooksLiveMetric;
    netIncome: QuickBooksLiveMetric;
  };
  accounts: {
    activeCount: number;
    bankAccountCount: number;
    includedBankAccounts: string[];
  };
  reports: QuickBooksLiveReport[];
  lastRefreshedAt: string | null;
}

export interface QuickBooksLiveOverviewResponse {
  overview?: QuickBooksLiveOverview;
  error?: string;
}

export interface QuickBooksRefreshResponse {
  refreshed?: true;
  syncRunId?: string;
  error?: string;
}
