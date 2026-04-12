import { apiClient } from '../../../shared/api/client';

export const expensesApi = {
  list: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/expenses');
    void apiClient;
    return Promise.resolve({ data: [] });
  },
  create: (payload: unknown) => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/expenses', payload);
    void apiClient;
    return Promise.resolve({ data: { id: `mock-${Date.now()}`, ...((payload as object) ?? {}) } });
  },
};
