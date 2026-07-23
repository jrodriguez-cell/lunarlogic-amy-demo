export default function IntegrationsLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded bg-slate-800" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-800" />
      </div>
      <div className="h-72 rounded-xl border border-slate-700 bg-slate-800/40" />
    </div>
  );
}
