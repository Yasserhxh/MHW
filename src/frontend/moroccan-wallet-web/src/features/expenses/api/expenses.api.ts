import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { Expense, CreateExpenseRequest, ExpenseFilters } from '../types/expenses.types';

export const expensesApi = {
  list: (filters?: ExpenseFilters) =>
    apiClient.get<PagedResult<Expense>>('/expenses', { params: filters }),

  get: (id: string) => apiClient.get<Expense>(`/expenses/${id}`),

  create: (data: CreateExpenseRequest) =>
    apiClient.post<Expense>('/expenses', data),

  update: (id: string, data: Partial<CreateExpenseRequest>) =>
    apiClient.put<Expense>(`/expenses/${id}`, data),

  delete: (id: string) => apiClient.delete(`/expenses/${id}`),

  summary: () =>
    apiClient.get<{
      totalThisMonth: number;
      totalLastMonth: number;
      byCategory: { category: string; total: number }[];
    }>('/expenses/summary'),
};
