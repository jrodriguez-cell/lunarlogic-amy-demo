import type {
  QuickBooksConnectionStatusResponse,
  QuickBooksConnectionSummary,
  QuickBooksLiveOverview,
  QuickBooksLiveOverviewResponse,
  QuickBooksRefreshResponse,
} from "@/types/quickbooks-live";

export class ApplicationApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApplicationApiError";
  }
}

async function parseResponse<T extends { error?: string }>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const payload = (await response.json()) as T;

  if (!response.ok) {
    throw new ApplicationApiError(
      payload.error || fallbackMessage,
      response.status,
    );
  }

  return payload;
}

export async function fetchQuickBooksLiveOverview(): Promise<QuickBooksLiveOverview> {
  const response = await fetch(
    "/api/integrations/quickbooks/live-overview",
    { cache: "no-store" },
  );
  const payload = await parseResponse<QuickBooksLiveOverviewResponse>(
    response,
    "QuickBooks live data is unavailable.",
  );

  if (!payload.overview) {
    throw new ApplicationApiError(
      "QuickBooks returned an incomplete live-data response.",
      502,
    );
  }

  return payload.overview;
}

export async function fetchQuickBooksConnectionStatus(): Promise<QuickBooksConnectionSummary> {
  const response = await fetch(
    "/api/integrations/quickbooks/status",
    { cache: "no-store" },
  );
  const payload = await parseResponse<QuickBooksConnectionStatusResponse>(
    response,
    "QuickBooks connection status is unavailable.",
  );

  if (!payload.connection) {
    throw new ApplicationApiError(
      "QuickBooks returned an incomplete connection response.",
      502,
    );
  }

  return payload.connection;
}

export async function refreshQuickBooksLiveOverview(): Promise<QuickBooksRefreshResponse> {
  const response = await fetch(
    "/api/integrations/quickbooks/refresh",
    { method: "POST" },
  );

  return parseResponse<QuickBooksRefreshResponse>(
    response,
    "QuickBooks data could not be refreshed.",
  );
}

export async function refreshQuickBooksCompanyInfo(): Promise<void> {
  const response = await fetch(
    "/api/integrations/quickbooks/company-info",
    { method: "POST" },
  );

  await parseResponse<{ error?: string }>(
    response,
    "QuickBooks CompanyInfo could not be refreshed.",
  );
}

export async function disconnectQuickBooksConnection(): Promise<void> {
  const response = await fetch(
    "/api/integrations/quickbooks/disconnect",
    { method: "POST" },
  );

  await parseResponse<{ error?: string }>(
    response,
    "QuickBooks could not be disconnected.",
  );
}
