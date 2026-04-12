import { apiClient } from '../../../shared/api/client';

export const dashboardApi = {
  overview: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/dashboard/overview');
    void apiClient;
    return Promise.resolve({
      data: {
        totalBalance: 12450,
        thisMonthExpenses: 3200,
        sharedExpenses: 870,
      },
    });
  },
};
