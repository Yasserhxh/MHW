import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
  },
}));

import { dashboardApi } from './dashboard.api';

describe('dashboardApi', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('maps backend dashboard data into the frontend snapshot shape', async () => {
    get
      .mockResolvedValueOnce({
        data: {
          totalSpent: 2400,
          totalBudget: 5000,
          byCategory: [{ categoryId: 'cat-1', categoryName: 'Groceries', total: 1200, count: 4 }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'tx-1',
              categoryId: 'cat-1',
              categoryName: 'Groceries',
              walletId: 'wallet-1',
              walletName: 'Main Bank Wallet',
              amount: 350,
              currency: 'MAD',
              type: 'Expense',
              paymentMethod: 'bank transfer',
              description: 'Carrefour Market',
              notes: 'Weekly groceries',
              date: '2026-04-12T00:00:00Z',
              createdAt: '2026-04-12T10:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 5,
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [{ id: 'rem-1', title: 'Water bill', dueDate: '2026-04-14T00:00:00Z', isCompleted: false }],
          total: 1,
          page: 1,
          pageSize: 6,
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'notif-1',
              title: 'Reminder due',
              body: 'Water bill is due tomorrow',
              isRead: false,
              createdAt: '2026-04-13T08:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 5,
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'price-1',
              productId: 'prod-1',
              productName: 'Milk',
              price: 12.5,
              storeName: 'Marjane',
              observedAt: '2026-04-11T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 5,
        },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'group-1', currency: 'MAD' }],
      })
      .mockResolvedValueOnce({
        data: { balances: [{ userId: 'user-1', balance: -180 }] },
      })
      .mockResolvedValueOnce({
        data: {
          items: [{ id: 'shared-1', paidById: 'user-2', amount: 180, description: 'Internet bill', createdAt: '2026-04-10T00:00:00Z' }],
          total: 1,
          page: 1,
          pageSize: 4,
        },
      });

    const response = await dashboardApi.getSnapshot();

    expect(response.data.summary).toMatchObject({
      currentMonthSpent: 2400,
      remainingBudget: 2600,
      householdBalance: -180,
    });
    expect(response.data.recentTransactions[0]).toMatchObject({
      id: 'tx-1',
      currency: 'MAD',
      type: 'expense',
      walletLabel: 'Main Bank Wallet',
      paymentMethodLabel: 'Bank Transfer',
      notes: 'Weekly groceries',
    });
    expect(response.data.notifications[0].status).toBe('unread');
  });

  it('keeps optional dashboard sections empty instead of failing the whole snapshot', async () => {
    get
      .mockResolvedValueOnce({
        data: {
          totalSpent: 0,
          totalBudget: 0,
          byCategory: [],
        },
      })
      .mockRejectedValueOnce(new Error('transactions unavailable'))
      .mockRejectedValueOnce(new Error('reminders unavailable'))
      .mockRejectedValueOnce(new Error('notifications unavailable'))
      .mockRejectedValueOnce(new Error('prices unavailable'))
      .mockRejectedValueOnce(new Error('groups unavailable'));

    const response = await dashboardApi.getSnapshot();

    expect(response.data.summary).toMatchObject({
      currentMonthSpent: 0,
      remainingBudget: 0,
      upcomingItemsCount: 0,
      householdBalance: 0,
    });
    expect(response.data.recentTransactions).toEqual([]);
    expect(response.data.upcomingReminders).toEqual([]);
    expect(response.data.notifications).toEqual([]);
    expect(response.data.groceryPrices).toEqual([]);
    expect(response.data.sharedActivity).toEqual([]);
  });
});
