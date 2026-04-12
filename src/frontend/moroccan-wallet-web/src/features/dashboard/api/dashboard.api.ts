import { apiClient } from '@/shared/api/client';
import { getMockDb } from '@/shared/mocks/mockDb';
import type { DashboardSnapshot } from '../types/dashboard.types';
import { withMockLatency } from '@/shared/mocks/mockApi';

export const dashboardApi = {
  getSnapshot: async (): Promise<{ data: DashboardSnapshot }> => {
    void apiClient;
    const db = getMockDb();
    const monthTransactions = db.transactions.filter((item) => item.date.startsWith('2026-04'));
    const expenseTransactions = monthTransactions.filter((item) => item.type === 'expense');
    const spent = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
    const budget = db.onboarding[db.currentUserId]?.monthlyBudget ?? 7000;
    const reminderCount = db.reminders.filter((item) => item.status === 'upcoming' || item.status === 'overdue').length;
    const memberBalance = db.household.members.find((item) => item.email === db.users.find((user) => user.id === db.currentUserId)?.email)?.balance ?? 0;

    const snapshot: DashboardSnapshot = {
      summary: {
        currentMonthSpent: spent,
        remainingBudget: Math.max(budget - spent, 0),
        upcomingItemsCount: reminderCount,
        householdBalance: memberBalance,
        monthBudget: budget,
      },
      recentTransactions: expenseTransactions.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        category: db.categories.find((category) => category.id === item.categoryId)?.name ?? 'Other',
        amount: item.amount,
        date: item.date,
        status: 'paid',
      })),
      upcomingReminders: db.reminders.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        dueDate: item.dueDate,
        status: item.status === 'snoozed' ? 'upcoming' : item.status === 'completed' ? 'completed' : item.status,
      })),
      sharedActivity: db.household.sharedExpenses.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: `Paid by ${db.household.members.find((member) => member.id === item.paidByMemberId)?.name ?? item.paidByMemberId}`,
        amount: item.amount,
        createdAt: item.createdAt,
      })),
      topCategories: Object.values(
        expenseTransactions.reduce<Record<string, { id: string; label: string; amount: number }>>((acc, tx) => {
          const category = db.categories.find((item) => item.id === tx.categoryId);
          const key = category?.id ?? tx.categoryId;
          if (!acc[key]) {
            acc[key] = { id: key, label: category?.name ?? 'Other', amount: 0 };
          }
          acc[key].amount += tx.amount;
          return acc;
        }, {})
      )
        .map((item) => ({ ...item, percent: spent ? Math.round((item.amount / spent) * 100) : 0 }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 4),
      groceryPrices: db.groceryPrices.slice(0, 4).map((item) => ({
        id: item.id,
        productName: item.productName,
        latestPrice: item.price,
        previousPrice: item.price + 3,
        storeName: item.storeName,
        updatedAt: item.date,
      })),
      notifications: db.notifications.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        createdAt: item.createdAt,
        status: item.isRead ? 'read' : 'unread',
      })),
    };

    return withMockLatency(snapshot, 180);
  },
};
