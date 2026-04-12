import { describe, expect, it } from 'vitest';
import { notificationsApi } from './notifications.api';

describe('notificationsApi', () => {
  it('marks a single notification as read', async () => {
    await notificationsApi.markRead('n-1');
    const notifications = await notificationsApi.list();

    expect(notifications.data.find((item) => item.id === 'n-1')?.isRead).toBe(true);
  });

  it('marks all notifications as read', async () => {
    await notificationsApi.markAllRead();
    const notifications = await notificationsApi.list();

    expect(notifications.data.every((item) => item.isRead)).toBe(true);
  });

  it('pushes a new mock notification to the top of the list', async () => {
    const created = await notificationsApi.pushMockNotification();
    const notifications = await notificationsApi.list();

    expect(created.data.title).toBe('Mock realtime update');
    expect(notifications.data[0].id).toBe(created.data.id);
    expect(notifications.data[0].isRead).toBe(false);
  });
});
