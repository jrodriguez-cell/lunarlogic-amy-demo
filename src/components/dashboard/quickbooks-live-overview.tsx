"use client";

import Link from "next/link";
import {
  Building2,
  CircleAlert,
  Database,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useQuickBooksLiveOverview,
  useRefreshQuickBooksLiveOverview,
} from "@/hooks/use-quickbooks-live";
import { cn } from "@/lib/utils";
import type {
  QuickBooksLiveMetric,
  QuickBooksLiveReport,
} from "@/types/quickbooks-live";

function formatMoney(
  value: number | null,
  currency: string,
): string {
  if (value === null) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Not refreshed yet";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-300">
      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
      Live QuickBooks
    </span>
  );
}

function MetricCard({ metric }: { metric: QuickBooksLiveMetric }) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-slate-900/25 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {metric.label}
        </p>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            metric.provenance === "live"
              ? "text-green-400"
              : "text-slate-500",
          )}
        >
          {metric.provenance === "live" ? "Live" : "Unavailable"}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 font-heading text-2xl font-semibold",
          metric.value === null ? "text-slate-500" : "text-slate-100",
        )}
      >
        {formatMoney(metric.value, metric.currency)}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        {metric.detail}
      </p>
    </div>
  );
}

function ReportSummary({ report }: { report: QuickBooksLiveReport }) {
  return (
    <div className="min-w-0">
      <div className="mb-3">
        <p className="font-semibold text-slate-200">{report.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {[report.startPeriod, report.endPeriod]
            .filter(Boolean)
            .join(" to ") || "Current QuickBooks period"}
          {report.basis ? ` · ${report.basis}` : ""}
        </p>
      </div>

      {report.lines.length > 0 ? (
        <div className="space-y-2">
          {report.lines.slice(0, 8).map((line, index) => (
            <div
              key={`${line.label}-${index}`}
              className="flex items-start justify-between gap-4 border-b border-slate-700/40 pb-2 text-sm last:border-0"
              style={{ paddingLeft: `${Math.min(line.depth, 2) * 10}px` }}
            >
              <span className="min-w-0 truncate text-slate-400">
                {line.label}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-slate-200">
                {formatMoney(line.amount, report.currency)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          QuickBooks returned no report lines for this period.
        </p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-700/70" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg bg-slate-800"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickBooksLiveOverviewPanel() {
  const overviewQuery = useQuickBooksLiveOverview();
  const refreshMutation = useRefreshQuickBooksLiveOverview();

  if (overviewQuery.isPending) {
    return <LoadingState />;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <Card className="border-red-400/20">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <div>
              <p className="font-semibold text-slate-200">
                Live QuickBooks data is unavailable
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {overviewQuery.error instanceof Error
                  ? overviewQuery.error.message
                  : "The live-data endpoint could not be loaded."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => void overviewQuery.refetch()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const overview = overviewQuery.data;
  const isConnected = overview.connection.status === "connected";
  const hasSnapshot = overview.lastRefreshedAt !== null;
  const coreReports = overview.reports.filter((report) =>
    [
      "balance_sheet",
      "profit_and_loss",
      "trial_balance",
    ].includes(report.type),
  );
  const mutationError =
    refreshMutation.error instanceof Error
      ? refreshMutation.error.message
      : null;

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <p className="font-semibold text-slate-200">
                Connect QuickBooks to load live financial values
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                Forecast, close, and covenant modules below remain demo data
                until their full service integrations and engines are ready.
              </p>
            </div>
          </div>
          <Link
            href="/api/integrations/quickbooks/connect"
            className={buttonVariants({ variant: "gradient" })}
          >
            Connect QuickBooks
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-green-400/15">
      <CardHeader className="border-b border-slate-700/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle>QuickBooks Live Overview</CardTitle>
              <LiveBadge />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {overview.connection.companyName ||
                overview.connection.legalEntityName}
              {" · "}
              {overview.connection.environment}
              {" · "}
              refreshed {formatTimestamp(overview.lastRefreshedAt)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {hasSnapshot ? "Refresh live data" : "Load live data"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {(mutationError || overview.sync.status === "failed") && (
          <div className="flex items-start gap-3 rounded-lg border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {mutationError ||
                overview.sync.errorSummary ||
                "The latest QuickBooks refresh failed."}
            </span>
          </div>
        )}

        {overview.sync.warnings.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">
                QuickBooks refresh completed with warnings
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-amber-100/80">
                {overview.sync.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!hasSnapshot ? (
          <div className="flex items-start gap-3 rounded-lg border border-blue-400/15 bg-blue-400/[0.07] p-4">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Connection verified; accounting snapshot not loaded yet
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Load live data to retrieve the Chart of Accounts, Balance
                Sheet, Profit and Loss, Trial Balance, and A/R and A/P aging
                summaries.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Object.values(overview.metrics).map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </div>

            <div className="rounded-lg border border-slate-700/70 bg-slate-900/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-200">
                    Chart of Accounts
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {overview.accounts.activeCount} active accounts ·{" "}
                    {overview.accounts.bankAccountCount} included bank accounts
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-400">
                  Live QuickBooks
                </span>
              </div>
              {overview.accounts.includedBankAccounts.length > 0 && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Book cash includes:{" "}
                  {overview.accounts.includedBankAccounts.join(", ")}
                </p>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {coreReports.map((report) => (
                <ReportSummary key={report.type} report={report} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
