import { LunarLogicMark } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-700/60 px-4 py-4 sm:px-6 lg:px-8 print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-1.5 text-xs text-slate-500">
        <LunarLogicMark className="h-3.5 w-3.5" />
        <span>
          Built by <span className="font-semibold text-slate-400">LunarLogic</span> ·
          lunarlogic.ai
        </span>
      </div>
    </footer>
  );
}
