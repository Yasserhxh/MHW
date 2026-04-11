export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderStatus = 'upcoming' | 'today' | 'overdue' | 'completed';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  frequency: ReminderFrequency;
  status: ReminderStatus;
  amount?: number;
  currency?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateReminderRequest {
  title: string;
  description?: string;
  dueDate: string;
  frequency: ReminderFrequency;
  amount?: number;
  currency?: string;
}
