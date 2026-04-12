import { apiClient } from '../../../shared/api/client';

export const notificationsApi = {
  list: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/notifications');
    void apiClient;
    return Promise.resolve({ data: [] });
  },
  markAllRead: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.post('/notifications/mark-all-read');
    void apiClient;
    return Promise.resolve({ data: { success: true } });
  },
};
