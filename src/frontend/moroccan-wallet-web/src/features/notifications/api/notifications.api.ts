import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/api/types';
import type { AppNotification } from '../types/notifications.types';

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; page?: number; pageSize?: number }) =>
    apiClient.get<PagedResult<AppNotification>>('/notifications', { params }),

  markRead: (id: string) =>
    apiClient.post(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.post('/notifications/read-all'),

  unreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count'),

  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};
