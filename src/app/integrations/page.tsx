import { Suspense } from "react";

import { QuickBooksIntegrationPanel } from "@/components/integrations/quickbooks-integration-panel";
import { PageHeader } from "@/components/page-header";

function IntegrationPanelFallback() {
  return (
    <div className="h-72 animate-pulse rounded-xl border border-slate-700 bg-slate-800/40" />
  );
}

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Manage the accounting systems connected to LunarLogic"
      />

      <Suspense fallback={<IntegrationPanelFallback />}>
        <QuickBooksIntegrationPanel />
      </Suspense>
    </div>
  );
}
