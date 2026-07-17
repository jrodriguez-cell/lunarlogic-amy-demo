import { CircleCheck, Clock, LoaderCircle, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CloseStatus } from "@/data/close-checklist";

export const statusMeta: Record<
  CloseStatus,
  { label: string; color: string; bg: string }
> = {
  auto_completed: { label: "Auto-completed", color: "text-green-400", bg: "bg-green-400/10" },
  needs_review: { label: "Needs review", color: "text-amber-400", bg: "bg-amber-400/10" },
  in_progress: { label: "In progress", color: "text-blue-400", bg: "bg-blue-400/10" },
  not_started: { label: "Not started", color: "text-slate-500", bg: "bg-slate-500/10" },
};

export function StatusIcon({
  status,
  className,
}: {
  status: CloseStatus;
  className?: string;
}) {
  const base = cn("h-4 w-4", statusMeta[status].color, className);
  switch (status) {
    case "auto_completed":
      return <CircleCheck className={base} />;
    case "needs_review":
      return <Clock className={base} />;
    case "in_progress":
      return <LoaderCircle className={cn(base, "animate-spin [animation-duration:3s]")} />;
    case "not_started":
      return <Circle className={base} />;
  }
}
