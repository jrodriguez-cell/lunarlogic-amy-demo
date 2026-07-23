import { NextResponse } from "next/server";

import {
  isLoopbackRequest,
  noStoreJson,
} from "@/server/http/api-response";
import {
  DEMO_LEGAL_ENTITY_ID,
} from "@/server/quickbooks/constants";
import { getSandboxQuickBooksConfig } from "@/server/quickbooks/config";
import { createAuthorizationUrl } from "@/server/quickbooks/oauth";
import { createOAuthState } from "@/server/quickbooks/oauth-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isLoopbackRequest(request)) {
    return noStoreJson(
      { error: "QuickBooks sandbox setup is available only on loopback." },
      { status: 403 },
    );
  }

  try {
    getSandboxQuickBooksConfig();
    const state = await createOAuthState(DEMO_LEGAL_ENTITY_ID);
    const response = NextResponse.redirect(createAuthorizationUrl(state));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return noStoreJson(
      {
        error:
          "QuickBooks connection setup is unavailable. Check the server configuration.",
      },
      { status: 503 },
    );
  }
}
