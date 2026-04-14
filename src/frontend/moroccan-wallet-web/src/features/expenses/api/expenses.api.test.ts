import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post, put, del } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    post,
    put,
    delete: del,
  },
}));

import { expensesApi } from './expenses.api';

describe('expensesApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    del.mockReset();
  });

  it('requests the backend transaction list with supported server-side filters', async () => {
    get
      .mockResolvedValueOnce({
        data: { year: 2026, month: 4, totalSpent: 1200, totalBudget: 2000, byCategory: [] },
      })
      .mockResolvedValueOnce({
        data: { items: [], total: 0, page: 1, pageSize: 100 },
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await expensesApi.getSnapshot({
      search: 'grocery',
      dateRange: 'last-30-days',
      category: '11111111-1111-1111-1111-111111111111',
      walletId: 'all',
      paymentMethodId: 'all',
    });

    expect(get).toHaveBeenNthCalledWith(
      2,
      '/transactions',
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          pageSize: 100,
          search: 'grocery',
          categoryId: '11111111-1111-1111-1111-111111111111',
        }),
      })
    );
  });

  it('maps backend transaction notes for detail views instead of using tags as notes', async () => {
    get.mockResolvedValueOnce({
      data: {
        id: 'expense-1',
        categoryId: 'category-1',
        categoryName: 'Groceries',
        walletId: 'wallet-1',
        walletName: 'Main Wallet',
        amount: 400,
        currency: 'MAD',
        type: 'Expense',
        paymentMethod: 'bank transfer',
        description: 'Weekly groceries',
        notes: 'Actual detail note',
        date: '2026-04-13T00:00:00Z',
        isRecurring: false,
        tags: 'legacy-tag',
        createdAt: '2026-04-13T09:00:00Z',
      },
    });

    const response = await expensesApi.getById('expense-1');

    expect(response.data.notes).toBe('Actual detail note');
    expect(response.data.tags).toBe('legacy-tag');
  });
});
