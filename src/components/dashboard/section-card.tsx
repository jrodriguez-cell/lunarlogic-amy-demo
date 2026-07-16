import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface LegendItem {
  label: string;
  color: string; // hex
  variant?: "solid" | "dashed";
}

export function LegendRow({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          {it.variant === "dashed" ? (
            <span
              className="inline-block h-0 w-4 border-t-2 border-dashed"
              style={{ borderColor: it.color }}
            />
          ) : (
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: it.color }}
            />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  legend,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  legend?: LegendItem[];
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-slate-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
      {legend && (
        <div className="mt-3 border-t border-slate-700/60 pt-3">
          <LegendRow items={legend} />
        </div>
      )}
    </Card>
  );
}
