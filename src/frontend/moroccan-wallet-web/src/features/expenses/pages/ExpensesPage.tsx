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
import { normalizeApiError } from '@/shared/utils/error';

export default function ExpensesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    dateRange: 'this-month',
    type: 'all',
    category: 'all',
    walletId: 'all',
    paymentMethodId: 'all',
  });
  const [submitError, setSubmitError] = useState('');
  const { data, isLoading, isError, refetch } = useExpensesSnapshot(filters);
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
      const matchesType = filters.type === 'all' ? true : transaction.type === filters.type;
      const matchesWallet = filters.walletId === 'all' ? true : transaction.walletId === filters.walletId;
      const matchesPayment = filters.paymentMethodId === 'all' ? true : transaction.paymentMethodId === filters.paymentMethodId;
      return matchesType && matchesWallet && matchesPayment;
    });
  }, [data, filters]);

  const visibleSummary = useMemo(() => {
    const spentThisMonth = filteredTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const incomeThisMonth = filteredTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const categoryTotals = new Map<string, { label: string; amount: number }>();
    for (const transaction of filteredTransactions) {
      const current = categoryTotals.get(transaction.category) ?? {
        label: transaction.categoryLabel,
        amount: 0,
      };
      current.amount += transaction.amount;
      categoryTotals.set(transaction.category, current);
    }

    const topCategory = Array.from(categoryTotals.values()).sort((left, right) => right.amount - left.amount)[0];

    return {
      spentThisMonth,
      incomeThisMonth,
      transactionCount: filteredTransactions.length,
      topCategoryLabel: topCategory?.label ?? 'No categories yet',
    };
  }, [filteredTransactions]);

  const visibleCategoryBreakdown = useMemo(() => {
    const totals = new Map<string, { label: string; amount: number }>();

    for (const transaction of filteredTransactions) {
      const current = totals.get(transaction.category) ?? {
        label: transaction.categoryLabel,
        amount: 0,
      };
      current.amount += transaction.amount;
      totals.set(transaction.category, current);
    }

    const entries = Array.from(totals.entries()).map(([category, value]) => ({
      category,
      label: value.label,
      amount: value.amount,
    }));
    const max = entries.reduce((current, item) => Math.max(current, item.amount), 0);

    return entries
      .sort((left, right) => right.amount - left.amount)
      .map((item) => ({
        ...item,
        percent: max > 0 ? Math.max(8, Math.round((item.amount / max) * 100)) : 0,
      }));
  }, [filteredTransactions]);

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
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
            <QuickAddButton to="/expenses/new" label="Add Expense" />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total spent" value={formatCurrency(visibleSummary.spentThisMonth)} hint="Visible expense entries" tone="warning" />
        <StatCard label="Total income" value={formatCurrency(visibleSummary.incomeThisMonth)} hint="Visible income entries" tone="success" />
        <StatCard label="Transaction count" value={`${visibleSummary.transactionCount}`} hint="Currently visible entries" tone="info" />
        <StatCard label="Top category" value={visibleSummary.topCategoryLabel} hint="Largest visible bucket" tone="muted" />
      </div>

      <FilterBar>
        <div className="grid gap-3 lg:grid-cols-6">
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
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as ExpenseFilters['type'] }))}
          >
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
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
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600"
              onClick={() =>
                setFilters({
                search: '',
                dateRange: 'this-month',
                type: 'all',
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
              type="button"
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
              <TransactionTable
                items={filteredTransactions}
                getDetailHref={(item) => `/expenses/${item.id}`}
                onEdit={(item) => navigate(`/expenses/${item.id}`)}
                onDelete={(item) => navigate(`/expenses/${item.id}`)}
              />
              <div className="lg:hidden">
                <TransactionList items={filteredTransactions} getDetailHref={(item) => `/expenses/${item.id}`} />
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
            {visibleCategoryBreakdown.map((item) => (
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
            {!visibleCategoryBreakdown.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Category totals will appear once matching transactions are available.
              </div>
            ) : null}
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
          setSubmitError('');
          try {
            await createExpense.mutateAsync(values);
          } catch (error) {
            setSubmitError(normalizeApiError(error).message);
            throw error;
          }
        }}
        errorMessage={submitError}
      />
    </div>
  );
}
