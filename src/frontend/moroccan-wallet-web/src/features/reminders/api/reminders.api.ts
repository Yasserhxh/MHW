import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type { CreateReminderRequest, Reminder } from '../types/reminders.types';
import { getReminderStatus, mapReminderCategory, mapReminderFrequency, toReminderEnumValue } from '../lib/reminder';

type ReminderDto = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  amount?: number | null;
  dueDate: string;
  snoozedUntil?: string | null;
  frequency: string;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
};

function toReminder(item: ReminderDto): Reminder {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    dueDate: item.dueDate.slice(0, 10),
    recurrence: mapReminderFrequency(item.frequency),
    status: getReminderStatus({
      dueDate: item.dueDate,
      snoozedUntil: item.snoozedUntil ?? undefined,
      isCompleted: item.isCompleted,
      completedAt: item.completedAt,
      status: 'upcoming',
    }),
    amount: item.amount ?? undefined,
    currency: item.amount ? 'MAD' : undefined,
    snoozedUntil: item.snoozedUntil ?? undefined,
    completedAt: item.completedAt ?? undefined,
    createdAt: item.createdAt,
    category: mapReminderCategory(item.type),
    notes: item.description ?? undefined,
  };
}

function toReminderRequest(payload: CreateReminderRequest) {
  return {
    title: payload.title,
    description: payload.notes ?? payload.description ?? null,
    type: toReminderEnumValue(payload.category ?? 'custom'),
    amount: payload.amount ?? null,
    dueDate: payload.dueDate,
    frequency: toReminderEnumValue(payload.recurrence ?? 'once'),
  };
}

export const remindersApi = {
  list: async () => {
    const { data } = await apiClient.get<PagedResult<ReminderDto>>('/reminders', {
      params: { page: 1, pageSize: 100 },
    });
    return { data: data.items.map(toReminder) };
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ReminderDto>(`/reminders/${id}`);
    return { data: toReminder(data) };
  },

  save: async (payload: CreateReminderRequest, id?: string) => {
    const request = toReminderRequest(payload);

    if (id) {
      await apiClient.put(`/reminders/${id}`, request);
      return { data: true };
    }

    return apiClient.post('/reminders', request);
  },

  markComplete: async (id: string) => apiClient.post(`/reminders/${id}/complete`),

  snooze: async (id: string, until: string) => apiClient.post(`/reminders/${id}/snooze`, { until }),

  remove: async (id: string) => apiClient.delete(`/reminders/${id}`),
};
