import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm',
        className
      )}
    >
      <div className="grid gap-3">{children}</div>
    </section>
  );
}
