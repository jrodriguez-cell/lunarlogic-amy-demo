import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PlaceholderView } from "@/components/placeholder-view";

export default function CovenantMonitorPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Covenant Monitor"
        subtitle="Debt covenant headroom and compliance tracking"
      />
      <PlaceholderView
        icon={ShieldCheck}
        title="Debt Covenant Monitor"
        description="Continuously monitor DSCR, leverage, and fixed-charge coverage against lender thresholds — with early-warning headroom alerts. This view is being wired to demo data next."
      />
    </div>
  );
}
