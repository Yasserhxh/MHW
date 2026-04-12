import type { DashboardSnapshot } from '../types/dashboard.types';

export const dashboardSnapshotMock: DashboardSnapshot = {
  summary: {
    currentMonthSpent: 4890,
    remainingBudget: 2110,
    upcomingItemsCount: 4,
    householdBalance: -340,
    monthBudget: 7000,
  },
  recentTransactions: [
    { id: 'tx-1', title: 'Carrefour Market', category: 'Groceries', amount: 265, date: '2026-04-09', status: 'paid' },
    { id: 'tx-2', title: 'Taxi to work', category: 'Transport', amount: 42, date: '2026-04-09', status: 'paid' },
    { id: 'tx-3', title: 'Electricity bill', category: 'Utilities', amount: 410, date: '2026-04-12', status: 'upcoming' },
  ],
  upcomingReminders: [
    { id: 'rem-1', title: 'Internet subscription', dueDate: '2026-04-14', status: 'upcoming' },
    { id: 'rem-2', title: 'House cleaner transfer', dueDate: '2026-04-15', status: 'today' },
    { id: 'rem-3', title: 'Water bill split', dueDate: '2026-04-10', status: 'overdue' },
  ],
  sharedActivity: [
    { id: 'sa-1', title: 'Youssef added water bill', subtitle: 'Shared with 3 household members', amount: 180, createdAt: '2026-04-12T09:00:00Z' },
    { id: 'sa-2', title: 'Amina settled groceries', subtitle: 'Paid back to the main household wallet', amount: 220, createdAt: '2026-04-11T18:30:00Z' },
  ],
  topCategories: [
    { id: 'cat-1', label: 'Groceries', amount: 1820, percent: 37 },
    { id: 'cat-2', label: 'Utilities', amount: 1160, percent: 24 },
    { id: 'cat-3', label: 'Transport', amount: 910, percent: 19 },
    { id: 'cat-4', label: 'Household', amount: 640, percent: 13 },
  ],
  groceryPrices: [
    { id: 'gp-1', productName: 'Olive oil 1L', latestPrice: 62, previousPrice: 68, storeName: 'Marjane', updatedAt: '2026-04-11T17:00:00Z' },
    { id: 'gp-2', productName: 'Eggs x12', latestPrice: 18.5, previousPrice: 17.9, storeName: 'Carrefour', updatedAt: '2026-04-10T10:30:00Z' },
  ],
  notifications: [
    { id: 'n-1', title: 'Reminder due soon', message: 'Electricity bill is due in 2 days.', createdAt: '2026-04-12T08:00:00Z', status: 'unread' },
    { id: 'n-2', title: 'Shared expense updated', message: 'Water bill was added to the household group.', createdAt: '2026-04-11T19:15:00Z', status: 'read' },
  ],
};
