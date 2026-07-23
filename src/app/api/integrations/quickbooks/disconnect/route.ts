import {
  hasSameOrigin,
  isLoopbackRequest,
  noStoreJson,
} from "@/server/http/api-response";
import { getSandboxQuickBooksConfig } from "@/server/quickbooks/config";
import { DEMO_LEGAL_ENTITY_ID } from "@/server/quickbooks/constants";
import { disconnectQuickBooks } from "@/server/quickbooks/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isLoopbackRequest(request) || !hasSameOrigin(request)) {
    return noStoreJson(
      { error: "The disconnect request origin is invalid." },
      { status: 403 },
    );
  }

  try {
    getSandboxQuickBooksConfig();
    await disconnectQuickBooks(DEMO_LEGAL_ENTITY_ID);
    return noStoreJson({ disconnected: true });
  } catch {
    return noStoreJson(
      {
        error:
          "QuickBooks could not be disconnected. The authorization was left intact so the operation can be retried.",
      },
      { status: 502 },
    );
  }
}
