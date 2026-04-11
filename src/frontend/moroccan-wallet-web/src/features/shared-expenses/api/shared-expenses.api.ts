import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { SharedExpense, CreateSharedExpenseRequest, HouseholdMember, Settlement } from '../types/shared-expenses.types';

export const sharedExpensesApi = {
  list: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get<PagedResult<SharedExpense>>('/shared-expenses', { params }),

  get: (id: string) => apiClient.get<SharedExpense>(`/shared-expenses/${id}`),

  create: (data: CreateSharedExpenseRequest) =>
    apiClient.post<SharedExpense>('/shared-expenses', data),

  delete: (id: string) => apiClient.delete(`/shared-expenses/${id}`),

  members: () => apiClient.get<HouseholdMember[]>('/shared-expenses/members'),

  settlements: () => apiClient.get<Settlement[]>('/shared-expenses/settlements'),

  settle: (fromUserId: string, toUserId: string, amount: number) =>
    apiClient.post('/shared-expenses/settle', { fromUserId, toUserId, amount }),
};
