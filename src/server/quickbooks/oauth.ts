import {
  QUICKBOOKS_ACCOUNTING_SCOPE,
  QUICKBOOKS_AUTHORIZATION_ENDPOINT,
  QUICKBOOKS_REVOKE_ENDPOINT,
  QUICKBOOKS_TOKEN_ENDPOINT,
} from "./constants";
import { getQuickBooksConfig } from "./config";

const INTUIT_REQUEST_TIMEOUT_MS = 15_000;

export interface QuickBooksTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
  hardExpiresInSeconds: number | null;
  scopes: string[];
}

interface IntuitTokenPayload {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  x_refresh_token_expires_in?: unknown;
  x_refresh_token_hard_expires_in?: unknown;
  scope?: unknown;
}

export class QuickBooksOAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "QuickBooksOAuthError";
  }
}

function createBasicAuthorization(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function requirePositiveNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new QuickBooksOAuthError(
      `Intuit returned an invalid ${field} value.`,
      502,
    );
  }

  return value;
}

function parseTokenResponse(payload: IntuitTokenPayload): QuickBooksTokenResponse {
  if (
    typeof payload.access_token !== "string" ||
    !payload.access_token ||
    typeof payload.refresh_token !== "string" ||
    !payload.refresh_token
  ) {
    throw new QuickBooksOAuthError(
      "Intuit returned an incomplete token response.",
      502,
    );
  }

  const scopes =
    typeof payload.scope === "string"
      ? payload.scope.split(/\s+/).filter(Boolean)
      : [QUICKBOOKS_ACCOUNTING_SCOPE];

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    accessTokenExpiresInSeconds: requirePositiveNumber(
      payload.expires_in,
      "expires_in",
    ),
    refreshTokenExpiresInSeconds: requirePositiveNumber(
      payload.x_refresh_token_expires_in,
      "x_refresh_token_expires_in",
    ),
    hardExpiresInSeconds:
      payload.x_refresh_token_hard_expires_in === undefined
        ? null
        : requirePositiveNumber(
            payload.x_refresh_token_hard_expires_in,
            "x_refresh_token_hard_expires_in",
          ),
    scopes,
  };
}

async function requestTokens(
  body: URLSearchParams,
): Promise<QuickBooksTokenResponse> {
  const config = getQuickBooksConfig();
  const response = await fetch(QUICKBOOKS_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: createBasicAuthorization(
        config.clientId,
        config.clientSecret,
      ),
      "Content-Type": "application/x-www-form-urlencoded",
      "x-include-refresh-token-hard-expires-in": "true",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(INTUIT_REQUEST_TIMEOUT_MS),
  });

  const payload = (await response.json().catch(() => null)) as
    | IntuitTokenPayload
    | null;

  if (!response.ok || !payload) {
    throw new QuickBooksOAuthError(
      "Intuit rejected the OAuth token request.",
      response.status || 502,
    );
  }

  return parseTokenResponse(payload);
}

export function createAuthorizationUrl(state: string): URL {
  const config = getQuickBooksConfig();
  const url = new URL(QUICKBOOKS_AUTHORIZATION_ENDPOINT);

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", QUICKBOOKS_ACCOUNTING_SCOPE);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", state);

  return url;
}

export function exchangeAuthorizationCode(
  code: string,
): Promise<QuickBooksTokenResponse> {
  const config = getQuickBooksConfig();

  return requestTokens(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
  );
}

export function refreshAccessToken(
  refreshToken: string,
): Promise<QuickBooksTokenResponse> {
  return requestTokens(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
}

export async function revokeToken(token: string): Promise<void> {
  const config = getQuickBooksConfig();
  const response = await fetch(QUICKBOOKS_REVOKE_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: createBasicAuthorization(
        config.clientId,
        config.clientSecret,
      ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ token }),
    cache: "no-store",
    signal: AbortSignal.timeout(INTUIT_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new QuickBooksOAuthError(
      "Intuit rejected the token revocation request.",
      response.status || 502,
    );
  }
}
