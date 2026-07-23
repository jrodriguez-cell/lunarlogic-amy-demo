import {
  isLoopbackRequest,
  noStoreJson,
} from "@/server/http/api-response";
import { DEMO_LEGAL_ENTITY_ID } from "@/server/quickbooks/constants";
import { getQuickBooksLiveOverview } from "@/server/quickbooks/live-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isLoopbackRequest(request)) {
    return noStoreJson(
      { error: "QuickBooks sandbox data is available only on loopback." },
      { status: 403 },
    );
  }

  try {
    const overview = await getQuickBooksLiveOverview(
      DEMO_LEGAL_ENTITY_ID,
    );
    return noStoreJson({ overview });
  } catch {
    return noStoreJson(
      { error: "Unable to load the QuickBooks live-data overview." },
      { status: 500 },
    );
  }
}
