import { BookCheck } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PlaceholderView } from "@/components/placeholder-view";

export default function CloseWorkbookPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Close Workbook"
        subtitle="Month-end close checklist, ownership, and status"
      />
      <PlaceholderView
        icon={BookCheck}
        title="Month-End Close Workbook"
        description="Track every close task — reconciliations, accruals, and reviews — with owners, due dates, and real-time completion status. This view is being wired to demo data next."
      />
    </div>
  );
}
