import {
  hasSameOrigin,
  isLoopbackRequest,
  noStoreJson,
} from "@/server/http/api-response";
import { getQuickBooksCompanyInfo } from "@/server/quickbooks/client";
import { getSandboxQuickBooksConfig } from "@/server/quickbooks/config";
import { DEMO_LEGAL_ENTITY_ID } from "@/server/quickbooks/constants";
import { saveQuickBooksCompanyName } from "@/server/quickbooks/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isLoopbackRequest(request) || !hasSameOrigin(request)) {
    return noStoreJson(
      { error: "The CompanyInfo request origin is invalid." },
      { status: 403 },
    );
  }

  try {
    getSandboxQuickBooksConfig();
    const companyInfo = await getQuickBooksCompanyInfo(DEMO_LEGAL_ENTITY_ID);
    await saveQuickBooksCompanyName(
      DEMO_LEGAL_ENTITY_ID,
      companyInfo.companyName,
    );
    return noStoreJson({ companyInfo });
  } catch {
    return noStoreJson(
      { error: "Unable to retrieve QuickBooks CompanyInfo." },
      { status: 502 },
    );
  }
}
