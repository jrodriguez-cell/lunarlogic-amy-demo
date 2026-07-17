import { CircleCheck, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Reassuring empty state. Defaults to an "all clear" checkmark for review
 * queues, but the icon and copy can be overridden.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = CircleCheck,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-400/20 bg-green-400/10">
        <Icon className="h-6 w-6 text-green-400" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-200">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-slate-500">{description}</p>}
    </div>
  );
}
