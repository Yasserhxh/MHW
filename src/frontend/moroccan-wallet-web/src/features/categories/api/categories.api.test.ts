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

import { categoriesApi } from './categories.api';

describe('categoriesApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    del.mockReset();
  });

  it('maps real categories and transaction usage into the category view model', async () => {
    get
      .mockResolvedValueOnce({
        data: [
          {
            id: 'category-1',
            name: 'Groceries',
            color: '#0f766e',
            icon: 'shopping-basket',
            type: 'Expense',
            isDefault: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            { id: 'tx-1', categoryId: 'category-1', amount: 120 },
            { id: 'tx-2', categoryId: 'category-1', amount: 80 },
          ],
          total: 2,
          page: 1,
          pageSize: 100,
        },
      });

    const response = await categoriesApi.list();

    expect(response.data[0]).toMatchObject({
      id: 'category-1',
      type: 'expense',
      isDefault: true,
      usageCount: 2,
      totalAmount: 200,
    });
  });

  it('deletes a category through the backend delete endpoint', async () => {
    await categoriesApi.remove('category-1');

    expect(del).toHaveBeenCalledWith('/categories/category-1');
  });
});
