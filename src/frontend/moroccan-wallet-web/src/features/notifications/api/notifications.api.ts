import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type { AppNotification } from '../types/notifications.types';

type NotificationDto = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

function toNotification(item: NotificationDto): AppNotification {
  return {
    id: item.id,
    kind: (item.type?.toLowerCase().replace(/\s+/g, '_') || 'system') as AppNotification['kind'],
    title: item.title,
    message: item.body ?? '',
    isRead: item.isRead,
    createdAt: item.createdAt,
    actionUrl: '/notifications',
  };
}

export const notificationsApi = {
  list: async () => {
    const { data } = await apiClient.get<PagedResult<NotificationDto>>('/notifications', {
      params: { page: 1, pageSize: 50 },
    });
    return { data: data.items.map(toNotification) };
  },

  unreadCount: async () => {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  markRead: (id: string) => apiClient.post(`/notifications/${id}/read`),

  markAllRead: () => apiClient.post('/notifications/mark-all-read'),
};
