import { apiClient } from '@/shared/api/client';
import { getReminderStatus } from '@/features/reminders/lib/reminder';
import type { PagedResult } from '@/shared/types/api';
import type { DashboardSnapshot } from '../types/dashboard.types';

type ExpenseSummaryResponse = {
  totalSpent: number;
  totalBudget: number;
  byCategory: Array<{
    categoryId?: string | null;
    categoryName: string;
    total: number;
    count: number;
  }>;
};

type ExpenseDto = {
  id: string;
  categoryId?: string | null;
  categoryName?: string | null;
  walletId?: string | null;
  walletName?: string | null;
  amount: number;
  currency: string;
  type: string;
  paymentMethod?: string | null;
  description: string;
  notes?: string | null;
  date: string;
  createdAt: string;
};

type ReminderDto = {
  id: string;
  title: string;
  dueDate: string;
  snoozedUntil?: string | null;
  isCompleted: boolean;
};

type NotificationDto = {
  id: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  createdAt: string;
};

type GroupSummaryDto = {
  id: string;
  currency: string;
};

type GroupBalancesResponse = {
  balances: Array<{ userId: string; balance: number }>;
};

type SharedExpenseDto = {
  id: string;
  paidById: string;
  amount: number;
  description: string;
  createdAt: string;
};

type PriceEntryDto = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  storeName?: string | null;
  observedAt: string;
};

function getFulfilledValue<T>(result: PromiseSettledResult<{ data: T }>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value.data : fallback;
}

function toPaymentMethodLabel(paymentMethod?: string | null) {
  const normalized = paymentMethod?.trim();
  if (!normalized) {
    return 'Not specified';
  }

  return normalized
    .split(/[\s-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export const dashboardApi = {
  getSnapshot: async (): Promise<{ data: DashboardSnapshot }> => {
    const [
      summaryResult,
      transactionsResult,
      remindersResult,
      notificationsResult,
      priceEntriesResult,
      groupsResult,
    ] = await Promise.allSettled([
      apiClient.get<ExpenseSummaryResponse>('/transactions/summary'),
      apiClient.get<PagedResult<ExpenseDto>>('/transactions', { params: { page: 1, pageSize: 5 } }),
      apiClient.get<PagedResult<ReminderDto>>('/reminders', { params: { page: 1, pageSize: 6 } }),
      apiClient.get<PagedResult<NotificationDto>>('/notifications', { params: { page: 1, pageSize: 5 } }),
      apiClient.get<PagedResult<PriceEntryDto>>('/grocery-prices/entries', { params: { page: 1, pageSize: 5 } }),
      apiClient.get<GroupSummaryDto[]>('/shared-expenses/groups'),
    ]);

    if (summaryResult.status === 'rejected') {
      throw summaryResult.reason;
    }

    const summary = summaryResult.value.data;
    const transactions = getFulfilledValue(transactionsResult, { items: [], total: 0, page: 1, pageSize: 5 });
    const reminders = getFulfilledValue(remindersResult, { items: [], total: 0, page: 1, pageSize: 6 });
    const notifications = getFulfilledValue(notificationsResult, { items: [], total: 0, page: 1, pageSize: 5 });
    const priceEntries = getFulfilledValue(priceEntriesResult, { items: [], total: 0, page: 1, pageSize: 5 });
    const groups = getFulfilledValue(groupsResult, [] as GroupSummaryDto[]);

    const primaryGroup = groups[0] ?? null;

    const [balancesResult, sharedExpensesResult] = primaryGroup
      ? await Promise.allSettled([
          apiClient.get<GroupBalancesResponse>(`/shared-expenses/groups/${primaryGroup.id}/balances`),
          apiClient.get<PagedResult<SharedExpenseDto>>('/shared-expenses', {
            params: { groupId: primaryGroup.id, page: 1, pageSize: 4 },
          }),
        ])
      : [];

    const balances = primaryGroup ? getFulfilledValue(balancesResult!, { balances: [] }) : { balances: [] };
    const sharedExpenses = primaryGroup
      ? getFulfilledValue(sharedExpensesResult!, { items: [], total: 0, page: 1, pageSize: 4 })
      : { items: [], total: 0, page: 1, pageSize: 4 };

    const monthBudget = summary.totalBudget;
    const currentMonthSpent = summary.totalSpent;
    const remainingBudget = Math.max(monthBudget - currentMonthSpent, 0);
    const upcomingReminders = reminders.items.map((item) => ({
      id: item.id,
      title: item.title,
      dueDate: item.dueDate.slice(0, 10),
      status: (() => {
        const status = getReminderStatus({
          dueDate: item.dueDate,
          snoozedUntil: item.snoozedUntil ?? undefined,
          isCompleted: item.isCompleted,
          status: 'upcoming',
        });
        return status === 'snoozed' ? 'upcoming' : status;
      })(),
    }));

    const topCategories = summary.byCategory
      .sort((left, right) => right.total - left.total)
      .slice(0, 4)
      .map((item) => ({
        id: item.categoryId ?? item.categoryName.toLowerCase().replace(/\s+/g, '-'),
        label: item.categoryName,
        amount: item.total,
        percent: currentMonthSpent > 0 ? Math.round((item.total / currentMonthSpent) * 100) : 0,
      }));

    const snapshot: DashboardSnapshot = {
      summary: {
        currentMonthSpent,
        remainingBudget,
        upcomingItemsCount: upcomingReminders.filter((item) => item.status !== 'completed').length,
        householdBalance: balances.balances[0]?.balance ?? 0,
        monthBudget,
      },
      recentTransactions: transactions.items.map((item) => ({
        id: item.id,
        title: item.description,
        category: item.categoryName ?? 'Uncategorized',
        amount: item.amount,
        currency: item.currency ?? primaryGroup?.currency ?? 'MAD',
        type: item.type?.toLowerCase() === 'income' ? 'income' : 'expense',
        date: item.date.slice(0, 10),
        walletLabel: item.walletName ?? 'Unassigned',
        paymentMethodLabel: toPaymentMethodLabel(item.paymentMethod),
        notes: item.notes ?? undefined,
        status: 'paid',
      })),
      upcomingReminders,
      sharedActivity: sharedExpenses.items.map((item) => ({
        id: item.id,
        title: item.description,
        subtitle: `Paid by ${item.paidById}`,
        amount: item.amount,
        createdAt: item.createdAt,
      })),
      topCategories,
      groceryPrices: priceEntries.items.slice(0, 4).map((item, index, items) => ({
        id: item.id,
        productName: item.productName,
        latestPrice: item.price,
        previousPrice: items[index + 1]?.productId === item.productId ? items[index + 1].price : item.price,
        storeName: item.storeName ?? 'Unknown store',
        updatedAt: item.observedAt,
      })),
      notifications: notifications.items.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.body ?? '',
        createdAt: item.createdAt,
        status: item.isRead ? 'read' : 'unread',
      })),
    };

    return { data: snapshot };
  },
};
