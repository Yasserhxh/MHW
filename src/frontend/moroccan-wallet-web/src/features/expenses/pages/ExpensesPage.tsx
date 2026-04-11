import { useState } from 'react';
import { Plus, Search, Filter, Receipt } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { formatDateShort, formatRelativeDate } from '@/shared/utils/format';
import { AddExpenseDrawer } from '../components/AddExpenseDrawer';
import type { ExpenseCategory } from '../types/expenses.types';

// Placeholder data
const MOCK_EXPENSES = [
  { id: '1', title: 'Marjane groceries', amount: 342.5, category: 'food' as ExpenseCategory, date: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '2', title: 'Electricity bill', amount: 180, category: 'utilities' as ExpenseCategory, date: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Petit taxi', amount: 25, category: 'transport' as ExpenseCategory, date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '4', title: 'Pharmacie Maroc', amount: 67.8, category: 'health' as ExpenseCategory, date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '5', title: 'Internet subscription', amount: 259, category: 'utilities' as ExpenseCategory, date: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: '6', title: 'Restaurant L\'arganier', amount: 128, category: 'food' as ExpenseCategory, date: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const categoryColors: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700',
  utilities: 'bg-blue-100 text-blue-700',
  transport: 'bg-purple-100 text-purple-700',
  health: 'bg-green-100 text-green-700',
  housing: 'bg-amber-100 text-amber-700',
  education: 'bg-indigo-100 text-indigo-700',
  entertainment: 'bg-pink-100 text-pink-700',
  other: 'bg-slate-100 text-slate-600',
};

export default function ExpensesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'food', 'utilities', 'transport', 'health', 'housing', 'other'];

  const filtered = MOCK_EXPENSES.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || e.category === activeCategory;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <AppPageHeader
        title="Expenses"
        subtitle="Track your daily spending"
        action={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setDrawerOpen(true)}>
            Add expense
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card padding="sm" className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">This month</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">MAD 3,842</p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Last month</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">MAD 4,180</p>
          </div>
        </Card>
        <Card padding="sm" className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Filtered total</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">
              MAD {total.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Receipt}
            title="No expenses found"
            description="Try adjusting your filters or add your first expense."
            action={{ label: 'Add expense', onClick: () => setDrawerOpen(true) }}
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card padding="none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-700">{expense.title}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColors[expense.category] ?? categoryColors.other}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        <span title={expense.date}>{formatDateShort(expense.date)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <CurrencyAmount amount={expense.amount} negative />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((expense) => (
              <Card key={expense.id} padding="sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${categoryColors[expense.category] ?? categoryColors.other}`}>
                    {expense.category[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 text-sm truncate">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="default" size="sm">{expense.category}</Badge>
                      <span className="text-xs text-slate-400">{formatRelativeDate(expense.date)}</span>
                    </div>
                  </div>
                  <CurrencyAmount amount={expense.amount} negative />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <AddExpenseDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
