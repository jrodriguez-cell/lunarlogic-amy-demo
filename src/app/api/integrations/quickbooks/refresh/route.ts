import {
  hasSameOrigin,
  isLoopbackRequest,
  noStoreJson,
} from "@/server/http/api-response";
import { getSandboxQuickBooksConfig } from "@/server/quickbooks/config";
import { DEMO_LEGAL_ENTITY_ID } from "@/server/quickbooks/constants";
import { refreshQuickBooksLiveData } from "@/server/quickbooks/live-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isLoopbackRequest(request) || !hasSameOrigin(request)) {
    return noStoreJson(
      { error: "The QuickBooks refresh request origin is invalid." },
      { status: 403 },
    );
  }

  try {
    getSandboxQuickBooksConfig();
    const syncRunId = await refreshQuickBooksLiveData(
      DEMO_LEGAL_ENTITY_ID,
    );

    return noStoreJson({ refreshed: true, syncRunId });
  } catch {
    return noStoreJson(
      { error: "Unable to refresh live QuickBooks accounting data." },
      { status: 502 },
    );
  }
}
