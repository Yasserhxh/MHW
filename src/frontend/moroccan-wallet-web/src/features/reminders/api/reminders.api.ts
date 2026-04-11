import { apiClient } from '@/shared/api/client';
import type { Reminder, CreateReminderRequest } from '../types/reminders.types';

export const remindersApi = {
  list: (status?: string) =>
    apiClient.get<Reminder[]>('/reminders', { params: { status } }),

  get: (id: string) => apiClient.get<Reminder>(`/reminders/${id}`),

  create: (data: CreateReminderRequest) =>
    apiClient.post<Reminder>('/reminders', data),

  update: (id: string, data: Partial<CreateReminderRequest>) =>
    apiClient.put<Reminder>(`/reminders/${id}`, data),

  complete: (id: string) =>
    apiClient.post(`/reminders/${id}/complete`),

  delete: (id: string) => apiClient.delete(`/reminders/${id}`),
};
