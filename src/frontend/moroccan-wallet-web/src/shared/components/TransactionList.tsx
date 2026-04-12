import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CurrencyAmount } from './CurrencyAmount';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/shared/utils/cn';
import type { ExpenseTransactionListItem } from '@/features/expenses/types/expenses.types';

export function TransactionList({ items, compact = false }: { items: ExpenseTransactionListItem[]; compact?: boolean }) {
  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {items.map((item) => (
        <article
          className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
          key={item.id}
        >
          <div className="flex min-w-0 gap-3">
            <div
              className={cn(
                'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              )}
            >
              {item.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{item.title}</div>
              <div className="mt-1 text-sm text-slate-500">
                {item.categoryLabel} · {item.walletLabel} · {item.dateLabel}
              </div>
              {item.notes ? <div className="mt-1 line-clamp-1 text-sm text-slate-400">{item.notes}</div> : null}
            </div>
          </div>

          <div className="text-right">
            <CurrencyAmount
              amount={item.amount}
              positive={item.type === 'income'}
              negative={item.type === 'expense'}
              className="text-sm font-semibold"
            />
            <StatusBadge className="mt-2" status={item.type === 'income' ? 'settled' : 'paid'} />
          </div>
        </article>
      ))}
    </div>
  );
}
