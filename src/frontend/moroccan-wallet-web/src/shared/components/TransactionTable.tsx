import { MoreHorizontal, PencilLine, Trash2 } from 'lucide-react';
import { CurrencyAmount } from './CurrencyAmount';
import { StatusBadge } from './StatusBadge';
import type { ExpenseTransactionListItem } from '@/features/expenses/types/expenses.types';

export function TransactionTable({ items }: { items: ExpenseTransactionListItem[] }) {
  return (
    <div className="hidden overflow-hidden rounded-[1.5rem] border border-slate-200 lg:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/90">
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Wallet</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="px-4 py-4 text-sm text-slate-500">{item.dateLabel}</td>
              <td className="px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                {item.notes ? <div className="mt-1 max-w-xs text-sm text-slate-500">{item.notes}</div> : null}
              </td>
              <td className="px-4 py-4 text-sm text-slate-600">{item.categoryLabel}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{item.walletLabel}</td>
              <td className="px-4 py-4 text-sm text-slate-600">{item.paymentMethodLabel}</td>
              <td className="px-4 py-4">
                <StatusBadge status={item.type === 'income' ? 'settled' : 'paid'} />
              </td>
              <td className="px-4 py-4 text-right">
                <CurrencyAmount
                  amount={item.amount}
                  positive={item.type === 'income'}
                  negative={item.type === 'expense'}
                  className="text-sm font-semibold"
                />
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2 text-slate-400">
                  <button className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50" aria-label="Edit transaction">
                    <PencilLine className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50" aria-label="Delete transaction">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
