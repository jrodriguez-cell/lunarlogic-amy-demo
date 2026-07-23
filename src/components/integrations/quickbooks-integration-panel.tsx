"use client";

import { useSearchParams } from "next/navigation";
import {
  Building2,
  Check,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useDisconnectQuickBooksConnection,
  useQuickBooksConnectionStatus,
  useRefreshQuickBooksCompanyInfo,
} from "@/hooks/use-quickbooks-live";
import { cn } from "@/lib/utils";

const callbackMessages: Record<
  string,
  { tone: "success" | "warning"; text: string }
> = {
  connected: {
    tone: "success",
    text: "QuickBooks connected and CompanyInfo verified.",
  },
  connected_company_info_pending: {
    tone: "warning",
    text: "QuickBooks connected, but CompanyInfo could not be loaded. Retry below.",
  },
  authorization_denied: {
    tone: "warning",
    text: "QuickBooks authorization was cancelled.",
  },
  authorization_failed: {
    tone: "warning",
    text: "QuickBooks authorization failed. Start a new connection attempt.",
  },
  invalid_state: {
    tone: "warning",
    text: "The connection request expired or was already used. Please try again.",
  },
  invalid_callback: {
    tone: "warning",
    text: "Intuit returned an incomplete authorization response.",
  },
  missing_accounting_scope: {
    tone: "warning",
    text: "The QuickBooks Accounting permission was not granted.",
  },
  token_exchange_failed: {
    tone: "warning",
    text: "The authorization code could not be exchanged. Please reconnect.",
  },
};

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function errorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function QuickBooksIntegrationPanel() {
  const searchParams = useSearchParams();
  const callbackResult = searchParams.get("quickbooks");
  const callbackMessage = callbackResult
    ? callbackMessages[callbackResult]
    : undefined;
  const statusQuery = useQuickBooksConnectionStatus();
  const companyInfoMutation = useRefreshQuickBooksCompanyInfo();
  const disconnectMutation = useDisconnectQuickBooksConnection();
  const connection = statusQuery.data;
  const isConnected = connection?.status === "connected";
  const needsReconnect = connection?.status === "reconnect_required";
  const operation = companyInfoMutation.isPending
    ? "refreshing"
    : disconnectMutation.isPending
      ? "disconnecting"
      : null;
  const error =
    errorMessage(statusQuery.error) ??
    errorMessage(companyInfoMutation.error) ??
    errorMessage(disconnectMutation.error);
  const notice = companyInfoMutation.isSuccess
    ? "CompanyInfo refreshed from QuickBooks."
    : disconnectMutation.isSuccess
      ? "QuickBooks disconnected."
      : null;

  function refreshCompanyInfo() {
    disconnectMutation.reset();
    companyInfoMutation.mutate();
  }

  function disconnect() {
    if (
      !window.confirm(
        "Disconnect QuickBooks? LunarLogic will revoke its current authorization.",
      )
    ) {
      return;
    }

    companyInfoMutation.reset();
    disconnectMutation.mutate();
  }

  if (statusQuery.isPending) {
    return (
      <div className="h-72 animate-pulse rounded-xl border border-slate-700 bg-slate-800/40" />
    );
  }

  return (
    <div className="space-y-4">
      {callbackMessage && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
            callbackMessage.tone === "success"
              ? "border-green-400/20 bg-green-400/10 text-green-200"
              : "border-amber-400/20 bg-amber-400/10 text-amber-200",
          )}
          role="status"
        >
          {callbackMessage.tone === "success" ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{callbackMessage.text}</span>
        </div>
      )}

      {(error || notice) && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            error
              ? "border-red-400/20 bg-red-400/10 text-red-200"
              : "border-blue-400/20 bg-blue-400/10 text-blue-200",
          )}
          role="status"
          aria-live="polite"
        >
          {error ?? notice}
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-700/60">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>QuickBooks Online</CardTitle>
                <CardDescription className="mt-1">
                  Accounting source for {connection?.legalEntityName}
                </CardDescription>
              </div>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                isConnected
                  ? "border-green-400/20 bg-green-400/10 text-green-300"
                  : needsReconnect
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : "border-slate-600 bg-slate-800 text-slate-400",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected
                    ? "bg-green-400"
                    : needsReconnect
                      ? "bg-amber-400"
                      : "bg-slate-500",
                )}
              />
              {isConnected
                ? "Connected"
                : needsReconnect
                  ? "Reconnect required"
                  : "Not connected"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isConnected ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    QuickBooks company
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {connection?.companyName || "CompanyInfo pending"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Environment
                  </p>
                  <p className="mt-1 font-semibold capitalize text-slate-100">
                    {connection?.environment}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last verified
                  </p>
                  <p className="mt-1 font-semibold text-slate-100">
                    {formatTimestamp(connection?.lastSyncedAt ?? null)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-blue-400/15 bg-blue-400/[0.07] p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Tokens are managed server-side
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    LunarLogic encrypts connection credentials and refreshes
                    access automatically. Live accounting snapshots are loaded
                    separately from the dashboard.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={refreshCompanyInfo}
                  disabled={operation !== null}
                >
                  {operation === "refreshing" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh company info
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-300 hover:bg-red-400/10 hover:text-red-200"
                  onClick={disconnect}
                  disabled={operation !== null}
                >
                  {operation === "disconnecting" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unplug className="h-4 w-4" />
                  )}
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="font-semibold text-slate-200">
                  {needsReconnect
                    ? "QuickBooks needs to be authorized again."
                    : "Connect a QuickBooks Online company."}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  You will be sent to Intuit to choose a sandbox company and
                  approve read access to its accounting data.
                </p>
              </div>
              <a
                href="/api/integrations/quickbooks/connect"
                className={buttonVariants({ variant: "gradient" })}
              >
                Connect QuickBooks
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
