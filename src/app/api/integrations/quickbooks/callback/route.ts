import { NextRequest, NextResponse } from "next/server";

import { isLoopbackRequest } from "@/server/http/api-response";
import { getQuickBooksCompanyInfo } from "@/server/quickbooks/client";
import {
  DEMO_LEGAL_ENTITY_ID,
  QUICKBOOKS_ACCOUNTING_SCOPE,
} from "@/server/quickbooks/constants";
import { getSandboxQuickBooksConfig } from "@/server/quickbooks/config";
import {
  saveAuthorizedConnection,
  saveQuickBooksCompanyName,
} from "@/server/quickbooks/connection";
import {
  exchangeAuthorizationCode,
  revokeToken,
} from "@/server/quickbooks/oauth";
import { consumeOAuthState } from "@/server/quickbooks/oauth-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dashboardRedirect(
  request: NextRequest,
  result: string,
): NextResponse {
  const destination = new URL("/integrations", request.url);
  destination.searchParams.set("quickbooks", result);

  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

function hasValidRealmId(realmId: string): boolean {
  return /^\d{1,40}$/.test(realmId);
}

export async function GET(request: NextRequest) {
  if (!isLoopbackRequest(request)) {
    return dashboardRedirect(request, "sandbox_only");
  }

  try {
    getSandboxQuickBooksConfig();
  } catch {
    return dashboardRedirect(request, "sandbox_only");
  }

  const state = request.nextUrl.searchParams.get("state") ?? "";
  const consumedState = await consumeOAuthState(state);

  if (
    !consumedState ||
    consumedState.legalEntityId !== DEMO_LEGAL_ENTITY_ID
  ) {
    return dashboardRedirect(request, "invalid_state");
  }

  const authorizationError = request.nextUrl.searchParams.get("error");
  if (authorizationError) {
    const result =
      authorizationError === "access_denied"
        ? "authorization_denied"
        : "authorization_failed";
    return dashboardRedirect(request, result);
  }

  const code = request.nextUrl.searchParams.get("code") ?? "";
  const realmId = request.nextUrl.searchParams.get("realmId") ?? "";

  if (!code || code.length > 512 || !hasValidRealmId(realmId)) {
    return dashboardRedirect(request, "invalid_callback");
  }

  try {
    const tokens = await exchangeAuthorizationCode(code);

    if (!tokens.scopes.includes(QUICKBOOKS_ACCOUNTING_SCOPE)) {
      await revokeToken(tokens.refreshToken).catch(() => undefined);
      return dashboardRedirect(request, "missing_accounting_scope");
    }

    try {
      await saveAuthorizedConnection(
        consumedState.legalEntityId,
        realmId,
        tokens,
      );
    } catch (error) {
      await revokeToken(tokens.refreshToken).catch(() => undefined);
      throw error;
    }

    try {
      const companyInfo = await getQuickBooksCompanyInfo(
        consumedState.legalEntityId,
      );
      await saveQuickBooksCompanyName(
        consumedState.legalEntityId,
        companyInfo.companyName,
      );
    } catch {
      return dashboardRedirect(request, "connected_company_info_pending");
    }

    return dashboardRedirect(request, "connected");
  } catch {
    return dashboardRedirect(request, "token_exchange_failed");
  }
}
