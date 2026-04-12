import { cn } from '@/shared/utils/cn';

const tones = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  danger: 'bg-rose-50 text-rose-700 ring-rose-100',
  info: 'bg-sky-50 text-sky-700 ring-sky-100',
  muted: 'bg-slate-100 text-slate-600 ring-slate-200',
} as const;

export function StatCard({
  label,
  value,
  tone = 'muted',
  hint,
}: {
  label: string;
  value: string;
  tone?: keyof typeof tones;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      {hint ? (
        <div className={cn('mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1', tones[tone])}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
