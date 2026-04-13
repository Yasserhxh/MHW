import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Receipt, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { QuickAddButton } from '@/shared/components/common';
import { SectionCard } from '@/shared/components/SectionCard';
import { TransactionList } from '@/shared/components/TransactionList';
import { TransactionTable } from '@/shared/components/TransactionTable';
import { FilterBar } from '@/shared/components/FilterBar';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { StatCard } from '@/shared/components/StatCard';
import { AddExpenseDrawer } from '../components/AddExpenseDrawer';
import { useCreateExpense, useExpensesSnapshot } from '../hooks/useExpenses';
import type { ExpenseFilters } from '../types/expenses.types';
import { formatCurrency } from '@/shared/utils/format';

export default function ExpensesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    dateRange: 'this-month',
    category: 'all',
    walletId: 'all',
    paymentMethodId: 'all',
  });
  const { data, isLoading, isError, refetch } = useExpensesSnapshot();
  const createExpense = useCreateExpense();

  useEffect(() => {
    if ((location.state as { openQuickAdd?: boolean } | null)?.openQuickAdd) {
      setQuickAddOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const filteredTransactions = useMemo(() => {
    if (!data) return [];

    return data.transactions.filter((transaction) => {
      const matchesSearch = filters.search
        ? `${transaction.title} ${transaction.notes ?? ''}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const matchesCategory = filters.category === 'all' ? true : transaction.category === filters.category;
      const matchesWallet = filters.walletId === 'all' ? true : transaction.walletId === filters.walletId;
      const matchesPayment = filters.paymentMethodId === 'all' ? true : transaction.paymentMethodId === filters.paymentMethodId;
      return matchesSearch && matchesCategory && matchesWallet && matchesPayment;
    });
  }, [data, filters]);

  if (isLoading) {
    return <LoadingState message="Loading transactions..." />;
  }

  if (isError || !data) {
    return <ErrorState message="We could not load your expenses right now." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Expenses"
        subtitle="Browse personal transactions, filter quickly, and capture a new expense without leaving the page."
        action={
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
            <QuickAddButton to="/expenses/new" label="Add Expense" />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total spent this month" value={formatCurrency(data.summary.spentThisMonth)} hint="Personal expenses only" tone="warning" />
        <StatCard label="Total income this month" value={formatCurrency(data.summary.incomeThisMonth)} hint="Incoming cash tracked" tone="success" />
        <StatCard label="Transaction count" value={`${data.summary.transactionCount}`} hint="All recorded entries" tone="info" />
        <StatCard label="Top category" value={data.summary.topCategoryLabel} hint="Largest spending bucket" tone="muted" />
      </div>

      <FilterBar>
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className="block w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search transactions"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            />
          </div>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.dateRange}
            onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value as ExpenseFilters['dateRange'] }))}
          >
            <option value="this-month">This month</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="last-90-days">Last 90 days</option>
          </select>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value as ExpenseFilters['category'] }))}
          >
            <option value="all">All categories</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.walletId}
            onChange={(event) => setFilters((current) => ({ ...current, walletId: event.target.value as ExpenseFilters['walletId'] }))}
          >
            <option value="all">All wallets</option>
            {data.wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <select
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.paymentMethodId}
            onChange={(event) => setFilters((current) => ({ ...current, paymentMethodId: event.target.value as ExpenseFilters['paymentMethodId'] }))}
          >
            <option value="all">All payment methods</option>
            {data.paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
          <button
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600"
            onClick={() =>
              setFilters({
                search: '',
                dateRange: 'this-month',
                category: 'all',
                walletId: 'all',
                paymentMethodId: 'all',
              })
            }
          >
            Reset filters
          </button>
        </div>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard
          title="Transactions"
          action={
            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
              onClick={() => setQuickAddOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Quick add
            </button>
          }
        >
          {filteredTransactions.length ? (
            <>
              <TransactionTable items={filteredTransactions} />
              <div className="lg:hidden">
                <TransactionList items={filteredTransactions} />
              </div>
            </>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No transactions match these filters"
              description="Try widening the date range or add a new transaction to start your history."
              action={{ label: 'Add first expense', onClick: () => setQuickAddOpen(true) }}
            />
          )}
        </SectionCard>

        <SectionCard title="Category summary">
          <div className="space-y-4">
            {data.categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{formatCurrency(item.amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-teal-600" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <AddExpenseDrawer
        open={isQuickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        categories={data.categories}
        wallets={data.wallets}
        paymentMethods={data.paymentMethods}
        submitting={createExpense.isPending}
        onSubmit={async (values) => {
          await createExpense.mutateAsync(values);
        }}
      />
    </div>
  );
}
