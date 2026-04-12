import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

export interface DashboardPreviewItem {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
  tone?: 'default' | 'warning' | 'success' | 'danger';
}

const toneStyles = {
  default: 'border-slate-200 bg-white',
  warning: 'border-amber-100 bg-amber-50/50',
  success: 'border-emerald-100 bg-emerald-50/40',
  danger: 'border-rose-100 bg-rose-50/40',
} as const;

export function DashboardPreviewList({
  items,
  emptyLabel = 'Nothing to show right now.',
}: {
  items: DashboardPreviewItem[];
  emptyLabel?: string;
}) {
  if (!items.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const content = (
          <div
            className={cn(
              'flex items-center justify-between gap-3 rounded-2xl border p-4 transition',
              toneStyles[item.tone ?? 'default']
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-500">{item.subtitle}</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {item.meta ? <span className="hidden whitespace-nowrap sm:inline">{item.meta}</span> : null}
              {item.href ? <ChevronRight className="h-4 w-4" /> : null}
            </div>
          </div>
        );

        return item.href ? (
          <Link key={item.id} to={item.href}>
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}
