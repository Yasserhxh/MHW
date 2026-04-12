import { apiClient } from '@/shared/api/client';

export const groceryPricesApi = {
  list: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/grocery-prices');
    void apiClient;
    return Promise.resolve({ data: [] });
  },
};
