import { apiClient } from '../../../shared/api/client';
export const notificationsApi = { list: () => apiClient.get('/notifications'), markAllRead: () => apiClient.post('/notifications/mark-all-read') };
