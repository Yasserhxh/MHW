import type { Reminder, ReminderCategory, ReminderFrequency, ReminderStatus } from '../types/reminders.types';

type ReminderStatusInput = Pick<Reminder, 'dueDate' | 'snoozedUntil' | 'status'> & {
  isCompleted?: boolean;
  completedAt?: string | null;
};

export const reminderTypeOptions: Array<{ value: ReminderCategory; label: string }> = [
  { value: 'rent', label: 'Rent' },
  { value: 'internet', label: 'Internet' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water', label: 'Water' },
  { value: 'school', label: 'School' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'custom', label: 'Custom' },
];

export const reminderFrequencyOptions: Array<{ value: ReminderFrequency; label: string }> = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function mapReminderFrequency(value: string): ReminderFrequency {
  const normalized = value.toLowerCase();
  if (normalized === 'daily' || normalized === 'weekly' || normalized === 'monthly' || normalized === 'yearly') {
    return normalized;
  }

  return 'once';
}

export function mapReminderCategory(value?: string | null): ReminderCategory {
  const normalized = value?.toLowerCase() as ReminderCategory | undefined;
  return reminderTypeOptions.some((option) => option.value === normalized) ? normalized! : 'custom';
}

export function getReminderStatus(item: ReminderStatusInput): ReminderStatus {
  if (item.isCompleted || item.status === 'completed' || item.completedAt) {
    return 'completed';
  }

  if (item.snoozedUntil && new Date(item.snoozedUntil) > new Date()) {
    return 'snoozed';
  }

  const due = new Date(item.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  if (dueDay.getTime() < today.getTime()) {
    return 'overdue';
  }

  if (dueDay.getTime() === today.getTime()) {
    return 'today';
  }

  return 'upcoming';
}

export function getReminderFrequencyLabel(value: ReminderFrequency): string {
  return reminderFrequencyOptions.find((option) => option.value === value)?.label ?? 'One-time';
}

export function getReminderCategoryLabel(value: ReminderCategory): string {
  return reminderTypeOptions.find((option) => option.value === value)?.label ?? 'Custom';
}

export function toReminderEnumValue(value: ReminderFrequency | ReminderCategory): string {
  return value;
}
