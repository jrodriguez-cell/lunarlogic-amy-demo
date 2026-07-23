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

const INTUIT_REQUEST_TIMEOUT_MS = 15_000;

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
  forceRefresh = false,
): Promise<Response> {
  const config = getQuickBooksConfig();
  const accessToken = await getQuickBooksAccessToken(
    legalEntityId,
    forceRefresh,
  );
  const url = new URL(`${config.apiBaseUrl}${path}`);
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
): Promise<T> {
  let response = await sendQuickBooksRequest(legalEntityId, path);

  if (response.status === 401) {
    response = await sendQuickBooksRequest(legalEntityId, path, true);
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
