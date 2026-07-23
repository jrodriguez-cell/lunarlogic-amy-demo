import { randomUUID } from "node:crypto";

import {
  Prisma,
  QuickBooksReportType,
  QuickBooksSyncStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";
import {
  getQuickBooksAccounts,
  getQuickBooksCompanyInfo,
  getQuickBooksReport,
  type QuickBooksAccountRecord,
  type QuickBooksReport,
  type QuickBooksReportName,
} from "@/server/quickbooks/client";
import {
  getQuickBooksConnectionSummary,
  saveQuickBooksCompanyName,
} from "@/server/quickbooks/connection";
import type {
  QuickBooksLiveMetric,
  QuickBooksLiveOverview,
  QuickBooksLiveReport,
  QuickBooksLiveReportLine,
  QuickBooksSyncState,
} from "@/types/quickbooks-live";

type DatabaseReportType =
  | "BALANCE_SHEET"
  | "PROFIT_AND_LOSS"
  | "TRIAL_BALANCE"
  | "AGED_RECEIVABLES"
  | "AGED_PAYABLES";

interface ReportDefinition {
  databaseType: DatabaseReportType;
  apiName: QuickBooksReportName;
}

interface StoredReportRow {
  reportType: DatabaseReportType;
  reportName: string;
  basis: string | null;
  currency: string | null;
  startPeriod: string | null;
  endPeriod: string | null;
  payload: unknown;
  fetchedAt: Date;
}

interface SyncRunRow {
  status: "RUNNING" | "SUCCEEDED" | "FAILED";
  recordCounts: unknown;
  warnings: string[];
  errorSummary: string | null;
  startedAt: Date;
  finishedAt: Date | null;
}

interface AccountSummaryRow {
  activeCount: bigint;
  bankAccountCount: bigint;
  bookCash: string;
}

interface BankAccountRow {
  name: string;
}

interface ReportColumnData {
  value?: unknown;
}

interface ReportRow {
  type?: unknown;
  group?: unknown;
  ColData?: ReportColumnData[];
  Header?: {
    ColData?: ReportColumnData[];
  };
  Summary?: {
    ColData?: ReportColumnData[];
  };
  Rows?: {
    Row?: ReportRow[];
  };
}

interface ReportPayload {
  Header?: {
    Time?: unknown;
    ReportName?: unknown;
    ReportBasis?: unknown;
    StartPeriod?: unknown;
    EndPeriod?: unknown;
    Currency?: unknown;
  };
  Rows?: {
    Row?: ReportRow[];
  };
}

const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    databaseType: "BALANCE_SHEET",
    apiName: "BalanceSheet",
  },
  {
    databaseType: "PROFIT_AND_LOSS",
    apiName: "ProfitAndLoss",
  },
  {
    databaseType: "TRIAL_BALANCE",
    apiName: "TrialBalance",
  },
  {
    databaseType: "AGED_RECEIVABLES",
    apiName: "AgedReceivables",
  },
  {
    databaseType: "AGED_PAYABLES",
    apiName: "AgedPayables",
  },
];

const REPORT_TYPE_TO_PUBLIC = {
  BALANCE_SHEET: "balance_sheet",
  PROFIT_AND_LOSS: "profit_and_loss",
  TRIAL_BALANCE: "trial_balance",
  AGED_RECEIVABLES: "aged_receivables",
  AGED_PAYABLES: "aged_payables",
} as const;

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replaceAll(",", ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function dateValue(value: unknown): Date | null {
  const raw = stringValue(value);

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function reportPayload(value: unknown): ReportPayload {
  return value && typeof value === "object"
    ? (value as ReportPayload)
    : {};
}

function reportRows(report: ReportPayload): ReportRow[] {
  return Array.isArray(report.Rows?.Row) ? report.Rows.Row : [];
}

function columnValues(
  columns: ReportColumnData[] | undefined,
): string[] {
  if (!Array.isArray(columns)) {
    return [];
  }

  return columns.map((column) => stringValue(column.value) ?? "");
}

function rowSummaryAmount(row: ReportRow): number | null {
  const values = columnValues(row.Summary?.ColData);

  for (let index = values.length - 1; index >= 0; index -= 1) {
    const amount = numberValue(values[index]);

    if (amount !== null) {
      return amount;
    }
  }

  return null;
}

function rowLabel(row: ReportRow): string {
  const summaryValues = columnValues(row.Summary?.ColData);
  const headerValues = columnValues(row.Header?.ColData);
  const dataValues = columnValues(row.ColData);

  return (
    summaryValues.find(Boolean) ??
    headerValues.find(Boolean) ??
    dataValues.find(Boolean) ??
    stringValue(row.group) ??
    "Report line"
  );
}

function collectSummaryLines(
  rows: ReportRow[],
  depth = 0,
): QuickBooksLiveReportLine[] {
  const lines: QuickBooksLiveReportLine[] = [];

  for (const row of rows) {
    if (row.Summary?.ColData) {
      lines.push({
        label: rowLabel(row),
        amount: rowSummaryAmount(row),
        depth,
      });
    }

    if (Array.isArray(row.Rows?.Row)) {
      lines.push(...collectSummaryLines(row.Rows.Row, depth + 1));
    }
  }

  return lines;
}

function collectDataLines(
  rows: ReportRow[],
  depth = 0,
): QuickBooksLiveReportLine[] {
  const lines: QuickBooksLiveReportLine[] = [];

  for (const row of rows) {
    const values = columnValues(row.ColData);

    if (values.length > 0) {
      const amount = [...values]
        .reverse()
        .map(numberValue)
        .find((value) => value !== null);

      lines.push({
        label: rowLabel(row),
        amount: amount ?? null,
        depth,
      });
    }

    if (Array.isArray(row.Rows?.Row)) {
      lines.push(...collectDataLines(row.Rows.Row, depth + 1));
    }
  }

  return lines;
}

function publicReport(row: StoredReportRow): QuickBooksLiveReport {
  const payload = reportPayload(row.payload);
  const summaryLines = collectSummaryLines(reportRows(payload));
  const lines =
    summaryLines.length > 0
      ? summaryLines
      : collectDataLines(reportRows(payload));

  return {
    type: REPORT_TYPE_TO_PUBLIC[row.reportType],
    name: row.reportName,
    basis: row.basis,
    currency: row.currency ?? "USD",
    startPeriod: row.startPeriod,
    endPeriod: row.endPeriod,
    fetchedAt: row.fetchedAt.toISOString(),
    lines: lines.slice(0, 14),
  };
}

function findGroupAmount(
  rows: ReportRow[],
  groups: string[],
): number | null {
  const normalizedGroups = groups.map((group) => group.toLowerCase());

  for (const row of rows) {
    const group = stringValue(row.group)?.toLowerCase();
    const label = rowLabel(row).toLowerCase();

    if (
      (group && normalizedGroups.includes(group)) ||
      normalizedGroups.some((candidate) => label === candidate)
    ) {
      const amount = rowSummaryAmount(row);

      if (amount !== null) {
        return amount;
      }
    }

    if (Array.isArray(row.Rows?.Row)) {
      const nested = findGroupAmount(row.Rows.Row, groups);

      if (nested !== null) {
        return nested;
      }
    }
  }

  return null;
}

function lastSummaryAmount(report: ReportPayload): number | null {
  const lines = collectSummaryLines(reportRows(report)).filter(
    (line) => line.amount !== null,
  );

  return lines.at(-1)?.amount ?? null;
}

function liveMetric(
  label: string,
  value: number | null,
  currency: string,
  detail: string,
): QuickBooksLiveMetric {
  return {
    label,
    value,
    currency,
    provenance: value === null ? "unavailable" : "live",
    detail,
  };
}

function reportHeader(
  report: QuickBooksReport,
  fallbackName: string,
) {
  return {
    reportName: stringValue(report.Header?.ReportName) ?? fallbackName,
    basis: stringValue(report.Header?.ReportBasis),
    currency: stringValue(report.Header?.Currency),
    startPeriod: stringValue(report.Header?.StartPeriod),
    endPeriod: stringValue(report.Header?.EndPeriod),
    reportTime: dateValue(report.Header?.Time),
  };
}

function normalizedAccount(record: QuickBooksAccountRecord) {
  const quickBooksId = stringValue(record.Id);
  const name = stringValue(record.Name);
  const accountType = stringValue(record.AccountType);

  if (!quickBooksId || !name || !accountType) {
    return null;
  }

  return {
    quickBooksId,
    syncToken: stringValue(record.SyncToken),
    name,
    fullyQualifiedName: stringValue(record.FullyQualifiedName),
    classification: stringValue(record.Classification),
    accountType,
    accountSubType: stringValue(record.AccountSubType),
    currentBalance: numberValue(record.CurrentBalance),
    active: booleanValue(record.Active, true),
    sourceUpdatedAt: dateValue(record.MetaData?.LastUpdatedTime),
  };
}

function reportSearchParams(
  reportName: QuickBooksReportName,
  today: string,
  monthStart: string,
): Record<string, string> {
  if (
    reportName === "ProfitAndLoss" ||
    reportName === "TrialBalance"
  ) {
    return {
      start_date: monthStart,
      end_date: today,
      accounting_method: "Accrual",
    };
  }

  if (reportName === "BalanceSheet") {
    return {
      end_date: today,
      accounting_method: "Accrual",
    };
  }

  return {};
}

export async function refreshQuickBooksLiveData(
  legalEntityId: string,
): Promise<string> {
  const syncRunId = randomUUID();
  let failureStage = "starting the refresh";

  await prisma.quickBooksSyncRun.create({
    data: {
      id: syncRunId,
      legalEntityId,
      status: QuickBooksSyncStatus.RUNNING,
      source: "manual",
    },
  });

  try {
    failureStage = "retrieving CompanyInfo";
    const companyInfo = await getQuickBooksCompanyInfo(legalEntityId);
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monthStart = `${today.slice(0, 7)}-01`;
    failureStage = "retrieving the Chart of Accounts";
    const rawAccounts = await getQuickBooksAccounts(legalEntityId);
    failureStage = "retrieving financial reports";
    const reportResults = await Promise.allSettled(
      REPORT_DEFINITIONS.map(async (definition) => ({
        definition,
        payload: await getQuickBooksReport(
          legalEntityId,
          definition.apiName,
          reportSearchParams(definition.apiName, today, monthStart),
        ),
      })),
    );
    const reports = reportResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const accounts = rawAccounts
      .map(normalizedAccount)
      .filter((account) => account !== null);
    const accountWarnings =
      accounts.length === rawAccounts.length
        ? []
        : [
            `${rawAccounts.length - accounts.length} QuickBooks account records were skipped because required identifiers were missing.`,
          ];
    const reportWarnings = reportResults.flatMap((result, index) =>
      result.status === "rejected"
        ? [
            `${REPORT_DEFINITIONS[index].apiName} could not be retrieved from QuickBooks.`,
          ]
        : [],
    );
    const warnings = [...accountWarnings, ...reportWarnings];

    failureStage = "saving the Chart of Accounts";
    for (const account of accounts) {
      const accountData = {
        syncToken: account.syncToken,
        name: account.name,
        fullyQualifiedName: account.fullyQualifiedName,
        classification: account.classification,
        accountType: account.accountType,
        accountSubType: account.accountSubType,
        currentBalance:
          account.currentBalance === null
            ? null
            : new Prisma.Decimal(account.currentBalance),
        active: account.active,
        sourceUpdatedAt: account.sourceUpdatedAt,
        syncedAt: now,
      };

      await prisma.quickBooksAccount.upsert({
        where: {
          legalEntityId_quickBooksId: {
            legalEntityId,
            quickBooksId: account.quickBooksId,
          },
        },
        create: {
          id: randomUUID(),
          legalEntityId,
          quickBooksId: account.quickBooksId,
          ...accountData,
        },
        update: accountData,
      });
    }

    failureStage = "saving financial report snapshots";
    await prisma.$transaction(
      reports.map(({ definition, payload }) => {
        const header = reportHeader(payload, definition.apiName);

        return prisma.quickBooksReportSnapshot.create({
          data: {
            id: randomUUID(),
            legalEntityId,
            syncRunId,
            reportType:
              definition.databaseType as QuickBooksReportType,
            reportName: header.reportName,
            basis: header.basis,
            currency: header.currency,
            startPeriod: header.startPeriod,
            endPeriod: header.endPeriod,
            reportTime: header.reportTime,
            payload: JSON.parse(
              JSON.stringify(payload),
            ) as Prisma.InputJsonValue,
            fetchedAt: now,
          },
        });
      }),
    );

    failureStage = "saving the connected company";
    await saveQuickBooksCompanyName(
      legalEntityId,
      companyInfo.companyName,
    );

    failureStage = "finalizing the sync run";
    await prisma.quickBooksSyncRun.update({
      where: { id: syncRunId },
      data: {
        status: QuickBooksSyncStatus.SUCCEEDED,
        recordCounts: {
          accounts: accounts.length,
          reports: reports.length,
        },
        warnings,
        finishedAt: new Date(),
      },
    });

    return syncRunId;
  } catch (error) {
    await prisma.quickBooksSyncRun
      .update({
        where: { id: syncRunId },
        data: {
          status: QuickBooksSyncStatus.FAILED,
          errorSummary: `QuickBooks live-data refresh failed while ${failureStage}.`,
          finishedAt: new Date(),
        },
      })
      .catch(() => undefined);

    throw error;
  }
}

function syncState(
  status: SyncRunRow["status"] | undefined,
): QuickBooksSyncState {
  if (status === "RUNNING") {
    return "running";
  }

  if (status === "SUCCEEDED") {
    return "succeeded";
  }

  if (status === "FAILED") {
    return "failed";
  }

  return "never";
}

function recordCounts(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const accounts = numberValue(raw.accounts);
  const reports = numberValue(raw.reports);

  if (accounts === null || reports === null) {
    return null;
  }

  return { accounts, reports };
}

export async function getQuickBooksLiveOverview(
  legalEntityId: string,
): Promise<QuickBooksLiveOverview> {
  const connection =
    await getQuickBooksConnectionSummary(legalEntityId);
  const [syncRuns, accountSummaries, bankAccounts, storedReports] =
    await Promise.all([
      prisma.$queryRaw<SyncRunRow[]>`
        SELECT
          "status"::TEXT AS "status",
          "recordCounts",
          "warnings",
          "errorSummary",
          "startedAt",
          "finishedAt"
        FROM "QuickBooksSyncRun"
        WHERE "legalEntityId" = ${legalEntityId}
        ORDER BY "startedAt" DESC
        LIMIT 1
      `,
      prisma.$queryRaw<AccountSummaryRow[]>`
        SELECT
          COUNT(*) FILTER (WHERE "active") AS "activeCount",
          COUNT(*) FILTER (
            WHERE "active" AND "accountType" = 'Bank'
          ) AS "bankAccountCount",
          COALESCE(
            SUM("currentBalance") FILTER (
              WHERE "active" AND "accountType" = 'Bank'
            ),
            0
          )::TEXT AS "bookCash"
        FROM "QuickBooksAccount"
        WHERE "legalEntityId" = ${legalEntityId}
      `,
      prisma.$queryRaw<BankAccountRow[]>`
        SELECT "name"
        FROM "QuickBooksAccount"
        WHERE
          "legalEntityId" = ${legalEntityId}
          AND "active" = TRUE
          AND "accountType" = 'Bank'
        ORDER BY "name" ASC
        LIMIT 8
      `,
      prisma.$queryRaw<StoredReportRow[]>`
        SELECT DISTINCT ON ("reportType")
          "reportType"::TEXT AS "reportType",
          "reportName",
          "basis",
          "currency",
          "startPeriod",
          "endPeriod",
          "payload",
          "fetchedAt"
        FROM "QuickBooksReportSnapshot"
        WHERE "legalEntityId" = ${legalEntityId}
        ORDER BY "reportType", "fetchedAt" DESC
      `,
    ]);
  const syncRun = syncRuns[0];
  const accountSummary = accountSummaries[0] ?? {
    activeCount: 0n,
    bankAccountCount: 0n,
    bookCash: "0",
  };
  const reports = storedReports.map(publicReport);
  const reportMap = new Map(
    storedReports.map((report) => [report.reportType, report]),
  );
  const profitAndLoss = reportPayload(
    reportMap.get("PROFIT_AND_LOSS")?.payload,
  );
  const agedReceivables = reportPayload(
    reportMap.get("AGED_RECEIVABLES")?.payload,
  );
  const agedPayables = reportPayload(
    reportMap.get("AGED_PAYABLES")?.payload,
  );
  const profitAndLossRows = reportRows(profitAndLoss);
  const currency =
    stringValue(profitAndLoss.Header?.Currency) ??
    reportMap.get("BALANCE_SHEET")?.currency ??
    "USD";
  const bookCash = numberValue(accountSummary.bookCash);
  const latestFetchedAt = storedReports
    .map((report) => report.fetchedAt)
    .sort((left, right) => right.getTime() - left.getTime())[0];

  return {
    connection: {
      status: connection.status,
      companyName: connection.companyName,
      legalEntityName: connection.legalEntityName,
      environment: connection.environment,
    },
    sync: {
      status: syncState(syncRun?.status),
      startedAt: syncRun?.startedAt.toISOString() ?? null,
      finishedAt: syncRun?.finishedAt?.toISOString() ?? null,
      recordCounts: recordCounts(syncRun?.recordCounts),
      warnings: syncRun?.warnings ?? [],
      errorSummary: syncRun?.errorSummary ?? null,
    },
    metrics: {
      bookCash: liveMetric(
        "Book cash",
        bookCash,
        currency,
        `${Number(accountSummary.bankAccountCount)} active QuickBooks bank accounts`,
      ),
      openReceivables: liveMetric(
        "Open receivables",
        lastSummaryAmount(agedReceivables),
        currency,
        "QuickBooks A/R aging summary",
      ),
      openPayables: liveMetric(
        "Open payables",
        lastSummaryAmount(agedPayables),
        currency,
        "QuickBooks A/P aging summary",
      ),
      revenue: liveMetric(
        "Revenue",
        findGroupAmount(profitAndLossRows, ["Income", "Total Income"]),
        currency,
        "Current-month QuickBooks Profit and Loss",
      ),
      expenses: liveMetric(
        "Expenses",
        findGroupAmount(profitAndLossRows, [
          "Expenses",
          "Total Expenses",
        ]),
        currency,
        "Current-month QuickBooks Profit and Loss",
      ),
      netIncome: liveMetric(
        "Net income",
        findGroupAmount(profitAndLossRows, [
          "NetIncome",
          "Net Income",
        ]),
        currency,
        "Current-month QuickBooks Profit and Loss",
      ),
    },
    accounts: {
      activeCount: Number(accountSummary.activeCount),
      bankAccountCount: Number(accountSummary.bankAccountCount),
      includedBankAccounts: bankAccounts.map((account) => account.name),
    },
    reports,
    lastRefreshedAt: latestFetchedAt?.toISOString() ?? null,
  };
}
