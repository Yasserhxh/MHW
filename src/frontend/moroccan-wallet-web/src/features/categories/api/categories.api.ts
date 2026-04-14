import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type { CategoryPayload, CategoryView } from '../types/categories.types';

type CategoryDto = {
  id: string;
  name: string;
  color: string;
  icon: string;
  type?: string;
  isDefault: boolean;
};

type TransactionDto = {
  id: string;
  categoryId?: string | null;
  amount: number;
};

export const categoriesApi = {
  list: async () => {
    const [categoriesResponse, transactionsResponse] = await Promise.all([
      apiClient.get<CategoryDto[]>('/categories'),
      apiClient.get<PagedResult<TransactionDto>>('/transactions', {
        params: { page: 1, pageSize: 100 },
      }),
    ]);

    return {
      data: categoriesResponse.data.map((category) => {
        const linkedTransactions = transactionsResponse.data.items.filter((tx) => tx.categoryId === category.id);

        return {
          id: category.id,
          name: category.name,
          type: (category.type?.toLowerCase() as CategoryPayload['type']) || 'expense',
          color: category.color,
          icon: category.icon,
          isDefault: category.isDefault,
          usageCount: linkedTransactions.length,
          totalAmount: linkedTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        } satisfies CategoryView;
      }),
    };
  },

  save: async (payload: CategoryPayload, id?: string) => {
    const request = {
      name: payload.name,
      type: payload.type,
      color: payload.color,
      icon: payload.icon,
    };

    if (id) {
      return apiClient.put(`/categories/${id}`, request);
    }

    return apiClient.post('/categories', request);
  },

  remove: async (id: string) => {
    await apiClient.delete(`/categories/${id}`);
  },
};
