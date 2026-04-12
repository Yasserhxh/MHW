import { getMockDb, updateMockDb } from '@/shared/mocks/mockDb';
import { withMockTask } from '@/shared/mocks/mockApi';
import type { ReminderRecord } from '@/shared/mocks/appData';

export const remindersApi = {
  list: () => withMockTask(() => getMockDb().reminders, 180),
  getById: (id: string) => withMockTask(() => {
    const reminder = getMockDb().reminders.find((item) => item.id === id);
    if (!reminder) throw new Error('Reminder not found');
    return reminder;
  }, 180),
  save: (payload: Omit<ReminderRecord, 'id'>, id?: string) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        reminders: id
          ? db.reminders.map((item) => (item.id === id ? { ...item, ...payload } : item))
          : [...db.reminders, { id: `r-${Date.now()}`, ...payload }],
      }));
      return true;
    }, 220),
  markComplete: (id: string) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        reminders: db.reminders.map((item) => (item.id === id ? { ...item, status: 'completed' } : item)),
      }));
      return true;
    }, 150),
  snooze: (id: string) =>
    withMockTask(() => {
      updateMockDb((db) => ({
        ...db,
        reminders: db.reminders.map((item) => (item.id === id ? { ...item, status: 'snoozed' } : item)),
      }));
      return true;
    }, 150),
};
