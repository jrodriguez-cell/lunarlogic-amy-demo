import {
  getQuickBooksAccessToken,
  getQuickBooksRealmId,
} from "./connection";
import { getQuickBooksConfig } from "./config";

interface IntuitCompanyInfoResponse {
  CompanyInfo?: {
    CompanyName?: unknown;
    LegalName?: unknown;
  };
}

interface IntuitQueryResponse<T> {
  QueryResponse?: {
    Account?: T[];
    maxResults?: number;
    startPosition?: number;
  };
}

export interface QuickBooksAccountRecord {
  Id?: unknown;
  SyncToken?: unknown;
  Name?: unknown;
  FullyQualifiedName?: unknown;
  Classification?: unknown;
  AccountType?: unknown;
  AccountSubType?: unknown;
  CurrentBalance?: unknown;
  Active?: unknown;
  MetaData?: {
    LastUpdatedTime?: unknown;
  };
}

export interface QuickBooksReport {
  Header?: {
    Time?: unknown;
    ReportName?: unknown;
    ReportBasis?: unknown;
    StartPeriod?: unknown;
    EndPeriod?: unknown;
    Currency?: unknown;
    Option?: Array<{
      Name?: unknown;
      Value?: unknown;
    }>;
  };
  Columns?: unknown;
  Rows?: unknown;
}

export type QuickBooksReportName =
  | "BalanceSheet"
  | "ProfitAndLoss"
  | "TrialBalance"
  | "AgedReceivables"
  | "AgedPayables";

const INTUIT_REQUEST_TIMEOUT_MS = 15_000;
const QUICKBOOKS_QUERY_PAGE_SIZE = 1000;
const QUICKBOOKS_QUERY_MAX_PAGES = 20;

export interface QuickBooksCompanyInfo {
  companyName: string;
}

export class QuickBooksApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "QuickBooksApiError";
  }
}

async function sendQuickBooksRequest(
  legalEntityId: string,
  path: string,
  searchParams: Record<string, string> = {},
  forceRefresh = false,
): Promise<Response> {
  const config = getQuickBooksConfig();
  const accessToken = await getQuickBooksAccessToken(
    legalEntityId,
    forceRefresh,
  );
  const url = new URL(`${config.apiBaseUrl}${path}`);

  for (const [name, value] of Object.entries(searchParams)) {
    url.searchParams.set(name, value);
  }

  url.searchParams.set("minorversion", String(config.apiMinorVersion));

  return fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(INTUIT_REQUEST_TIMEOUT_MS),
  });
}

async function quickBooksGet<T>(
  legalEntityId: string,
  path: string,
  searchParams: Record<string, string> = {},
): Promise<T> {
  let response = await sendQuickBooksRequest(
    legalEntityId,
    path,
    searchParams,
  );

  if (response.status === 401) {
    response = await sendQuickBooksRequest(
      legalEntityId,
      path,
      searchParams,
      true,
    );
  }

  if (!response.ok) {
    throw new QuickBooksApiError(
      "QuickBooks rejected the API request.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function getQuickBooksCompanyInfo(
  legalEntityId: string,
): Promise<QuickBooksCompanyInfo> {
  const realmId = await getQuickBooksRealmId(legalEntityId);
  const encodedRealmId = encodeURIComponent(realmId);
  const payload = await quickBooksGet<IntuitCompanyInfoResponse>(
    legalEntityId,
    `/company/${encodedRealmId}/companyinfo/${encodedRealmId}`,
  );
  const rawCompanyName =
    payload.CompanyInfo?.CompanyName ?? payload.CompanyInfo?.LegalName;

  if (typeof rawCompanyName !== "string" || !rawCompanyName.trim()) {
    throw new QuickBooksApiError(
      "QuickBooks returned CompanyInfo without a company name.",
      502,
    );
  }

  return { companyName: rawCompanyName.trim() };
}

export async function getQuickBooksAccounts(
  legalEntityId: string,
): Promise<QuickBooksAccountRecord[]> {
  const realmId = await getQuickBooksRealmId(legalEntityId);
  const encodedRealmId = encodeURIComponent(realmId);
  const accounts: QuickBooksAccountRecord[] = [];

  for (let page = 0; page < QUICKBOOKS_QUERY_MAX_PAGES; page += 1) {
    const startPosition = page * QUICKBOOKS_QUERY_PAGE_SIZE + 1;
    const query = [
      "SELECT * FROM Account",
      `STARTPOSITION ${startPosition}`,
      `MAXRESULTS ${QUICKBOOKS_QUERY_PAGE_SIZE}`,
    ].join(" ");
    const payload = await quickBooksGet<
      IntuitQueryResponse<QuickBooksAccountRecord>
    >(
      legalEntityId,
      `/company/${encodedRealmId}/query`,
      { query },
    );
    const pageAccounts = Array.isArray(payload.QueryResponse?.Account)
      ? payload.QueryResponse.Account
      : [];

    accounts.push(...pageAccounts);

    if (pageAccounts.length < QUICKBOOKS_QUERY_PAGE_SIZE) {
      return accounts;
    }
  }

  throw new QuickBooksApiError(
    "QuickBooks returned more account pages than the safety limit allows.",
    502,
  );
}

export async function getQuickBooksReport(
  legalEntityId: string,
  reportName: QuickBooksReportName,
  searchParams: Record<string, string> = {},
): Promise<QuickBooksReport> {
  const realmId = await getQuickBooksRealmId(legalEntityId);
  const encodedRealmId = encodeURIComponent(realmId);

  return quickBooksGet<QuickBooksReport>(
    legalEntityId,
    `/company/${encodedRealmId}/reports/${reportName}`,
    searchParams,
  );
}
