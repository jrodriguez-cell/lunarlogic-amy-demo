import {
  isLoopbackRequest,
  noStoreJson,
} from "@/server/http/api-response";
import { DEMO_LEGAL_ENTITY_ID } from "@/server/quickbooks/constants";
import { getQuickBooksConnectionSummary } from "@/server/quickbooks/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isLoopbackRequest(request)) {
    return noStoreJson(
      { error: "QuickBooks sandbox status is available only on loopback." },
      { status: 403 },
    );
  }

  try {
    const connection = await getQuickBooksConnectionSummary(
      DEMO_LEGAL_ENTITY_ID,
    );
    return noStoreJson({ connection });
  } catch {
    return noStoreJson(
      { error: "Unable to read the QuickBooks connection status." },
      { status: 500 },
    );
  }
}
