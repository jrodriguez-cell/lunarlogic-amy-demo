import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

export function PlaceholderView({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl brand-gradient-surface">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h2 className="font-heading text-xl font-semibold text-slate-100">
            {title}
          </h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
          Preview — demo data
        </span>
      </CardContent>
    </Card>
  );
}
