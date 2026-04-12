import { describe, expect, it } from 'vitest';
import { remindersApi } from './reminders.api';

describe('remindersApi', () => {
  it('lists reminders', async () => {
    const response = await remindersApi.list();

    expect(response.data.length).toBeGreaterThanOrEqual(10);
  });

  it('returns a reminder by id', async () => {
    const response = await remindersApi.getById('r-1');

    expect(response.data.title).toBe('Internet bill');
  });

  it('creates, completes, and snoozes reminders', async () => {
    await remindersApi.save({
      title: 'Gym renewal',
      amount: 300,
      category: 'custom',
      dueDate: '2026-04-18',
      recurrence: 'monthly',
      notes: 'Optional note',
      notifyByEmail: false,
      priority: 'medium',
      status: 'upcoming',
    });

    let response = await remindersApi.list();
    const created = response.data.find((item) => item.title === 'Gym renewal');

    expect(created).toBeDefined();

    await remindersApi.markComplete(created!.id);
    response = await remindersApi.list();
    expect(response.data.find((item) => item.id === created!.id)?.status).toBe('completed');

    await remindersApi.snooze('r-1');
    response = await remindersApi.list();
    expect(response.data.find((item) => item.id === 'r-1')?.status).toBe('snoozed');
  });
});
