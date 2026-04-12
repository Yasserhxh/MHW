import { apiClient } from '../../../shared/api/client';

export const sharedExpensesApi = {
  list: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/shared-expenses');
    void apiClient;
    return Promise.resolve({ data: [] });
  },
};
