import { apiClient } from '@/shared/api/client';
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
  amount: number;
  description: string;
  date: string;
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

function mapReminderStatus(item: ReminderDto): 'upcoming' | 'overdue' | 'today' | 'completed' {
  if (item.isCompleted) {
    return 'completed';
  }

  if (item.snoozedUntil && new Date(item.snoozedUntil) > new Date()) {
    return 'upcoming';
  }

  const due = new Date(item.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) {
    return 'overdue';
  }

  if (due.getTime() === today.getTime()) {
    return 'today';
  }

  return 'upcoming';
}

export const dashboardApi = {
  getSnapshot: async (): Promise<{ data: DashboardSnapshot }> => {
    const [summaryResponse, transactionsResponse, remindersResponse, notificationsResponse, priceEntriesResponse, groupsResponse] =
      await Promise.all([
        apiClient.get<ExpenseSummaryResponse>('/transactions/summary'),
        apiClient.get<PagedResult<ExpenseDto>>('/transactions', { params: { page: 1, pageSize: 5 } }),
        apiClient.get<PagedResult<ReminderDto>>('/reminders', { params: { page: 1, pageSize: 6 } }),
        apiClient.get<PagedResult<NotificationDto>>('/notifications', { params: { page: 1, pageSize: 5 } }),
        apiClient.get<PagedResult<PriceEntryDto>>('/grocery-prices/entries', { params: { page: 1, pageSize: 5 } }),
        apiClient.get<GroupSummaryDto[]>('/shared-expenses/groups'),
      ]);

    const primaryGroup = groupsResponse.data[0] ?? null;

    const [balancesResponse, sharedExpensesResponse] = primaryGroup
      ? await Promise.all([
          apiClient.get<GroupBalancesResponse>(`/shared-expenses/groups/${primaryGroup.id}/balances`),
          apiClient.get<PagedResult<SharedExpenseDto>>('/shared-expenses', {
            params: { groupId: primaryGroup.id, page: 1, pageSize: 4 },
          }),
        ])
      : [{ data: { balances: [] } }, { data: { items: [], total: 0, page: 1, pageSize: 4 } }];

    const monthBudget = summaryResponse.data.totalBudget;
    const currentMonthSpent = summaryResponse.data.totalSpent;
    const remainingBudget = Math.max(monthBudget - currentMonthSpent, 0);
    const upcomingReminders = remindersResponse.data.items.map((item) => ({
      id: item.id,
      title: item.title,
      dueDate: item.dueDate.slice(0, 10),
      status: mapReminderStatus(item),
    }));

    const topCategories = summaryResponse.data.byCategory
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
        householdBalance: balancesResponse.data.balances[0]?.balance ?? 0,
        monthBudget,
      },
      recentTransactions: transactionsResponse.data.items.map((item) => ({
        id: item.id,
        title: item.description,
        category: item.categoryName ?? 'Uncategorized',
        amount: item.amount,
        date: item.date.slice(0, 10),
        status: 'paid',
      })),
      upcomingReminders,
      sharedActivity: sharedExpensesResponse.data.items.map((item) => ({
        id: item.id,
        title: item.description,
        subtitle: `Paid by ${item.paidById}`,
        amount: item.amount,
        createdAt: item.createdAt,
      })),
      topCategories,
      groceryPrices: priceEntriesResponse.data.items.slice(0, 4).map((item, index, items) => ({
        id: item.id,
        productName: item.productName,
        latestPrice: item.price,
        previousPrice: items[index + 1]?.productId === item.productId ? items[index + 1].price : item.price,
        storeName: item.storeName ?? 'Unknown store',
        updatedAt: item.observedAt,
      })),
      notifications: notificationsResponse.data.items.map((item) => ({
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
