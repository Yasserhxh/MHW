export type NotificationKind =
  | 'reminder_due'
  | 'reminder_overdue'
  | 'shared_expense_added'
  | 'settlement_request'
  | 'price_alert'
  | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
