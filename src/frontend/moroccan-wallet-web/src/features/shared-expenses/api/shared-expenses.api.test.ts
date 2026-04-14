import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    post,
  },
}));

vi.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: {
    getState: () => ({
      userId: 'user-1',
    }),
  },
}));

import { sharedExpensesApi } from './shared-expenses.api';

describe('sharedExpensesApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('maps group overview using the real balances and expense payloads', async () => {
    get
      .mockResolvedValueOnce({
        data: {
          id: 'group-1',
          name: 'Home',
          description: 'Flat bills',
          ownerId: 'user-1',
          currency: 'MAD',
          isActive: true,
          members: [
            { userId: 'user-1', joinedAt: '2026-04-01T00:00:00Z' },
            { userId: 'user-2', joinedAt: '2026-04-02T00:00:00Z' },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          groupId: 'group-1',
          groupName: 'Home',
          currency: 'MAD',
          balances: [
            { userId: 'user-1', paid: 800, owes: 400, balance: 400 },
            { userId: 'user-2', paid: 100, owes: 500, balance: -400 },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'expense-1',
              paidById: 'user-1',
              amount: 400,
              currency: 'MAD',
              description: 'Rent\n\nApril share',
              date: '2026-04-12T00:00:00Z',
              splitType: 'Equal',
              splits: [
                { userId: 'user-1', amount: 200, isSettled: true },
                { userId: 'user-2', amount: 200, isSettled: false },
              ],
              createdAt: '2026-04-12T09:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 50,
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'settlement-1',
            fromUserId: 'user-2',
            toUserId: 'user-1',
            recordedByUserId: 'user-1',
            amount: 125,
            currency: 'MAD',
            settledOn: '2026-04-13T00:00:00Z',
            notes: 'Partial catch-up',
            createdAt: '2026-04-13T09:30:00Z',
          },
        ],
      });

    const response = await sharedExpensesApi.getGroupOverview('group-1');

    expect(response.data.sharedExpenses[0]).toMatchObject({
      title: 'Rent',
      notes: 'April share',
      paidByName: 'You',
      settled: false,
    });
    expect(response.data.balances[1]).toMatchObject({
      userId: 'user-2',
      balance: -400,
      name: 'Member user-2',
    });
    expect(response.data.settlements[0]).toMatchObject({
      fromName: 'Member user-2',
      toName: 'You',
      amount: 125,
      notes: 'Partial catch-up',
    });
    expect(response.data.settlementHistoryAvailable).toBe(true);
  });

  it('creates an equal-split shared expense without over-posting a fake payer id', async () => {
    post.mockResolvedValueOnce({ data: { id: 'expense-1' } });

    await sharedExpensesApi.addExpense({
      groupId: 'group-1',
      title: 'Groceries',
      amount: 300,
      currency: 'MAD',
      date: '2026-04-14',
      participantIds: ['user-1', 'user-2'],
      notes: 'Weekly refill',
    });

    expect(post).toHaveBeenCalledWith('/shared-expenses', {
      groupId: 'group-1',
      amount: 300,
      currency: 'MAD',
      description: 'Groceries\n\nWeekly refill',
      date: '2026-04-14',
      splitType: 'equal',
      splits: [
        { userId: 'user-1', amount: 150 },
        { userId: 'user-2', amount: 150 },
      ],
    });
  });

  it('records settlements through the real backend endpoint', async () => {
    post.mockResolvedValueOnce({ data: { id: 'settlement-1' } });

    await sharedExpensesApi.createSettlement({
      groupId: 'group-1',
      fromUserId: 'user-2',
      toUserId: 'user-1',
      amount: 120,
      currency: 'MAD',
      settledOn: '2026-04-14',
      notes: 'Cash transfer',
    });

    expect(post).toHaveBeenCalledWith('/shared-expenses/settlements', {
      groupId: 'group-1',
      fromUserId: 'user-2',
      toUserId: 'user-1',
      amount: 120,
      currency: 'MAD',
      settledOn: '2026-04-14',
      notes: 'Cash transfer',
    });
  });
});
