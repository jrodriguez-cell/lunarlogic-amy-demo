import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { CloseView } from "@/components/close/close-view";

export default function ClosePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Close Workbook"
        subtitle="Month-end close workflow, reconciliations, and the assembled close package"
      />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-slate-800/40" />}>
        <CloseView />
      </Suspense>
    </div>
  );
}
