import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, post, put, deleteFn } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  deleteFn: vi.fn(),
}));

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get,
    post,
    put,
    delete: deleteFn,
  },
}));

import { remindersApi } from './reminders.api';

describe('remindersApi', () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
    deleteFn.mockReset();
  });

  it('maps backend reminder enums and status fields into the frontend reminder shape', async () => {
    get.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'rem-1',
            title: 'Annual insurance',
            description: 'Car insurance',
            type: 'Insurance',
            amount: 3200,
            dueDate: '2026-05-10T00:00:00Z',
            snoozedUntil: null,
            frequency: 'Yearly',
            isCompleted: false,
            completedAt: null,
            createdAt: '2026-04-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 100,
      },
    });

    const response = await remindersApi.list();

    expect(response.data[0]).toMatchObject({
      recurrence: 'yearly',
      category: 'insurance',
      status: 'upcoming',
      amount: 3200,
    });
  });

  it('sends backend-aligned enums for create and passes explicit snooze dates', async () => {
    post.mockResolvedValue({ data: { id: 'rem-1' } });

    await remindersApi.save({
      title: 'Rent',
      dueDate: '2026-04-20T09:00:00.000Z',
      recurrence: 'once',
      category: 'rent',
      notes: 'April rent',
      amount: 4500,
    });

    expect(post).toHaveBeenCalledWith('/reminders', {
      title: 'Rent',
      description: 'April rent',
      type: 'rent',
      amount: 4500,
      dueDate: '2026-04-20T09:00:00.000Z',
      frequency: 'once',
    });

    await remindersApi.snooze('rem-1', '2026-04-22T09:00:00.000Z');

    expect(post).toHaveBeenLastCalledWith('/reminders/rem-1/snooze', {
      until: '2026-04-22T09:00:00.000Z',
    });
  });
});
