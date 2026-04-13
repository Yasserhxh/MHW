import { apiClient } from '@/shared/api/client';
import type { PagedResult } from '@/shared/types/api';
import type { CreateReminderRequest, Reminder } from '../types/reminders.types';

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

function mapFrequency(value: string): Reminder['recurrence'] {
  const normalized = value.toLowerCase();
  if (normalized === 'daily' || normalized === 'weekly' || normalized === 'monthly') {
    return normalized;
  }
  return 'none';
}

function mapStatus(item: ReminderDto): Reminder['status'] {
  if (item.isCompleted) {
    return 'completed';
  }

  const due = new Date(item.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  if (item.snoozedUntil && new Date(item.snoozedUntil) > new Date()) {
    return 'snoozed';
  }
  if (dueDay.getTime() < today.getTime()) {
    return 'overdue';
  }
  if (dueDay.getTime() === today.getTime()) {
    return 'today';
  }
  return 'upcoming';
}

function toReminder(item: ReminderDto): Reminder {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    dueDate: item.dueDate.slice(0, 10),
    recurrence: mapFrequency(item.frequency),
    status: mapStatus(item),
    amount: item.amount ?? undefined,
    currency: item.amount ? 'MAD' : undefined,
    completedAt: item.completedAt ?? undefined,
    createdAt: item.createdAt,
    category: item.type,
    notes: item.description ?? undefined,
    priority: 'medium',
    notifyByEmail: false,
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
    const request = {
      title: payload.title,
      description: payload.notes ?? payload.description ?? null,
      type: payload.category ?? 'custom',
      amount: payload.amount ?? null,
      dueDate: payload.dueDate,
      frequency: payload.recurrence === 'none' ? 'none' : payload.recurrence,
    };

    if (id) {
      await apiClient.put(`/reminders/${id}`, request);
      return { data: true };
    }

    return apiClient.post('/reminders', request);
  },

  markComplete: async (id: string) => {
    return apiClient.post(`/reminders/${id}/complete`);
  },

  snooze: async (id: string) => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return apiClient.post(`/reminders/${id}/snooze`, { until });
  },
};
