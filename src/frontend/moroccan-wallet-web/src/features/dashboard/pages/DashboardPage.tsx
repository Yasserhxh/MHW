import { ChevronRight, ShoppingBasket, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePreferenceSettings } from '@/features/settings/hooks/useSettings';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { DashboardKpiRow } from '@/shared/components/DashboardKpiRow';
import { DashboardPreviewList } from '@/shared/components/DashboardPreviewList';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { ReminderList } from '@/shared/components/ReminderList';
import { SectionCard } from '@/shared/components/SectionCard';
import { TransactionList } from '@/shared/components/TransactionList';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { QuickAddButton } from '@/shared/components/common';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/format';
import { useDashboardSnapshot } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardSnapshot();
  const { data: preferences } = usePreferenceSettings();
  const currency = preferences?.currency ?? 'MAD';
  const locale = preferences?.locale ?? 'fr-MA';
  const formatMoney = (amount: number) => formatCurrency(amount, currency, locale);

  if (isLoading) {
    return <LoadingState message="Loading your household snapshot..." />;
  }

  if (isError || !data) {
    return <ErrorState message="We could not load the dashboard right now." onRetry={() => void refetch()} />;
  }

  const kpis = [
    {
      id: 'spent',
      label: 'Current Month Spent',
      value: formatMoney(data.summary.currentMonthSpent),
      hint:
        data.summary.monthBudget > 0
          ? `${Math.round((data.summary.currentMonthSpent / data.summary.monthBudget) * 100)}% of budget used`
          : 'No monthly budget set yet',
      tone: 'warning' as const,
    },
    {
      id: 'remaining',
      label: 'Remaining Budget',
      value: formatMoney(data.summary.remainingBudget),
      hint: 'Available for the rest of this month',
      tone: 'success' as const,
    },
    {
      id: 'upcoming',
      label: 'Upcoming Bills & Reminders',
      value: `${data.summary.upcomingItemsCount}`,
      hint: 'Needs attention this week',
      tone: 'info' as const,
    },
    {
      id: 'household',
      label: 'Household Balance',
      value: formatMoney(Math.abs(data.summary.householdBalance)),
      hint: data.summary.householdBalance < 0 ? 'You currently owe the household' : 'Household owes you',
      tone: data.summary.householdBalance < 0 ? 'danger' : 'success',
    },
  ];

  const transactionItems = data.recentTransactions.map((item) => ({
    ...item,
    walletId: `dashboard-wallet-${item.id}` as const,
    paymentMethodId: item.paymentMethodLabel.toLowerCase().replace(/\s+/g, '-') as const,
    createdAt: item.date,
    dateLabel: item.date,
    categoryLabel: item.category,
  }));

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Dashboard"
        subtitle="See what matters now across personal spending, shared activity, reminders, and household cash flow."
        action={<QuickAddButton label="Add expense" to="/expenses/new" />}
      />

      <DashboardKpiRow items={kpis} />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <SectionCard
          title="Recent transactions"
          action={
            <Link to="/expenses" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          }
        >
          <TransactionList items={transactionItems} getDetailHref={(item) => `/expenses/${item.id}`} />
        </SectionCard>

        <SectionCard title="Upcoming reminders">
          <ReminderList
            items={data.upcomingReminders.map((item) => ({
              id: item.id,
              title: item.title,
              dueDate: item.dueDate,
              status: item.status === 'today' ? 'upcoming' : item.status === 'completed' ? 'paid' : item.status,
            }))}
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Spending overview">
          {data.topCategories.length ? (
            <div className="space-y-4">
              {data.topCategories.map((category) => (
                <div key={category.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{category.label}</span>
                    <span className="text-slate-500">{formatMoney(category.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-teal-600" style={{ width: `${category.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardPreviewList items={[]} emptyLabel="No spending recorded this month yet." />
          )}
        </SectionCard>

        <SectionCard title="Shared activity">
          <DashboardPreviewList
            items={data.sharedActivity.map((activity) => ({
              id: activity.id,
              title: activity.title,
              subtitle: activity.subtitle,
              meta: formatMoney(activity.amount),
              href: `/shared-expenses/${activity.id}`,
            }))}
            emptyLabel="No shared expense activity yet."
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Grocery price updates">
          <DashboardPreviewList
            items={data.groceryPrices.map((item) => ({
              id: item.id,
              title: item.productName,
              subtitle: `${item.storeName} · was ${formatMoney(item.previousPrice)}`,
              meta: formatMoney(item.latestPrice),
              tone: item.latestPrice <= item.previousPrice ? 'success' : 'warning',
              href: '/grocery-prices',
            }))}
            emptyLabel="No grocery price updates yet."
          />
        </SectionCard>

        <SectionCard title="Notifications preview">
          <DashboardPreviewList
            items={data.notifications.map((notification) => ({
              id: notification.id,
              title: notification.title,
              subtitle: notification.message,
              meta: formatRelativeDate(notification.createdAt),
              tone: notification.status === 'unread' ? 'warning' : 'default',
              href: '/notifications',
            }))}
            emptyLabel="No new notifications right now."
          />
        </SectionCard>

        <SectionCard title="Household balance summary">
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <WalletCards className="h-4 w-4 text-teal-300" />
              Shared household snapshot
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-tight">
              <CurrencyAmount
                amount={data.summary.householdBalance}
                currency={currency}
                negative={data.summary.householdBalance < 0}
                positive={data.summary.householdBalance > 0}
                className="text-white"
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Shared expenses are still being built, but the household summary already highlights the balance direction.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-teal-300">
              <ShoppingBasket className="h-4 w-4" />
              Grocery and shared utility changes will stay visible here
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
