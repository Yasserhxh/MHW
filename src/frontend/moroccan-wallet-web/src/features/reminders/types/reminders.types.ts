export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderStatus = 'upcoming' | 'today' | 'overdue' | 'completed' | 'snoozed';
export type ReminderCategory =
  | 'rent'
  | 'internet'
  | 'electricity'
  | 'water'
  | 'school'
  | 'grocery'
  | 'insurance'
  | 'custom';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  recurrence: ReminderFrequency;
  status: ReminderStatus;
  amount?: number;
  currency?: string;
  snoozedUntil?: string;
  completedAt?: string;
  createdAt: string;
  category: ReminderCategory;
  notes?: string;
}

export interface CreateReminderRequest {
  title: string;
  description?: string;
  dueDate: string;
  recurrence: ReminderFrequency;
  amount?: number;
  currency?: string;
  category?: ReminderCategory;
  notes?: string;
}
