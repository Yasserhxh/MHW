import { apiClient } from '../../../shared/api/client';

export const remindersApi = {
  list: () => {
    // Real API (disabled during UI/layout development):
    // return apiClient.get('/reminders');
    void apiClient;
    return Promise.resolve({ data: [] });
  },
};
