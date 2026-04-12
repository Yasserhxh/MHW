import type { ReactNode } from 'react';

export function AppPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Overview</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </div>
  );
}
