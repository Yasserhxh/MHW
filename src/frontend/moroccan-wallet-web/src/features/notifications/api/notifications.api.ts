import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';

export const notificationsApi = {
  list: () => withMockTask(() => getMockDb().notifications, 120),
  markRead: (id: string) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        notifications: db.notifications.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      }));
      return true;
    }, 100),
  markAllRead: () =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        notifications: db.notifications.map((item) => ({ ...item, isRead: true })),
      }));
      return true;
    }, 100),
  pushMockNotification: () =>
    withMockTask(() => {
      const created = {
        id: `n-${Date.now()}`,
        kind: 'system' as const,
        title: 'Mock realtime update',
        message: 'A new in-app notification just arrived.',
        createdAt: new Date().toISOString(),
        isRead: false,
        actionUrl: '/notifications',
      };
      updateMockDb((db) => ({ ...db, notifications: [created, ...db.notifications] }));
      return created;
    }, 100),
};
