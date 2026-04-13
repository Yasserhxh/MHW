export type ReminderFrequency = 'none' | 'daily' | 'weekly' | 'monthly';
export type ReminderStatus = 'upcoming' | 'today' | 'overdue' | 'completed' | 'snoozed';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  recurrence: ReminderFrequency;
  status: ReminderStatus;
  amount?: number;
  currency?: string;
  completedAt?: string;
  createdAt: string;
  category: string;
  notes?: string;
  priority: 'medium';
  notifyByEmail: false;
}

export interface CreateReminderRequest {
  title: string;
  description?: string;
  dueDate: string;
  recurrence: ReminderFrequency;
  amount?: number;
  currency?: string;
  category?: string;
  notes?: string;
}
