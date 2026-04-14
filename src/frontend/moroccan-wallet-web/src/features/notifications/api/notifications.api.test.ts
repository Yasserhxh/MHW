import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    post,
  },
}));

import { notificationsApi } from './notifications.api';

describe('notificationsApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('maps backend notifications into the frontend notification shape', async () => {
    get.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'notif-1',
            type: 'reminder_due',
            title: 'Reminder due',
            body: 'Water bill is due tomorrow',
            isRead: false,
            readAt: null,
            createdAt: '2026-04-14T09:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 50,
      },
    });

    const response = await notificationsApi.list();

    expect(response.data[0]).toMatchObject({
      id: 'notif-1',
      kind: 'reminder_due',
      title: 'Reminder due',
      message: 'Water bill is due tomorrow',
      isRead: false,
      actionUrl: '/notifications',
    });
  });

  it('loads unread count and calls the real mark-all-read endpoint', async () => {
    get.mockResolvedValueOnce({ data: { count: 7 } });
    post.mockResolvedValueOnce({ data: null });

    const unreadCount = await notificationsApi.unreadCount();

    expect(unreadCount.data).toBe(7);

    await notificationsApi.markAllRead();

    expect(post).toHaveBeenCalledWith('/notifications/mark-all-read');
  });
});
