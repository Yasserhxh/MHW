import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export function SectionCard({
  title,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn('rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
