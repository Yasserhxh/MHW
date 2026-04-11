import { useState } from 'react';
import { Bell, Check, CheckCheck, AlarmClock, Users, ShoppingCart, Info } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatRelativeDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { useSignalR } from '../hooks/useSignalR';
import type { AppNotification, NotificationKind } from '../types/notifications.types';

const kindIcon: Record<NotificationKind, React.ElementType> = {
  reminder_due: AlarmClock,
  reminder_overdue: AlarmClock,
  shared_expense_added: Users,
  settlement_request: Users,
  price_alert: ShoppingCart,
  system: Info,
};

const kindColor: Record<NotificationKind, string> = {
  reminder_due: 'bg-amber-50 text-amber-600',
  reminder_overdue: 'bg-red-50 text-red-600',
  shared_expense_added: 'bg-blue-50 text-blue-600',
  settlement_request: 'bg-purple-50 text-purple-600',
  price_alert: 'bg-orange-50 text-orange-600',
  system: 'bg-slate-100 text-slate-600',
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1', kind: 'reminder_overdue', title: 'Rent payment overdue',
    message: 'Your rent payment of MAD 4,500 was due yesterday.',
    isRead: false, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    actionUrl: '/reminders',
  },
  {
    id: '2', kind: 'shared_expense_added', title: 'New shared expense',
    message: 'Fatima added "Groceries — MAD 540" to the household.',
    isRead: false, createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    actionUrl: '/shared-expenses',
  },
  {
    id: '3', kind: 'reminder_due', title: 'Internet bill due in 2 days',
    message: 'Your MAD 259 internet subscription is due on Friday.',
    isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString(),
    actionUrl: '/reminders',
  },
  {
    id: '4', kind: 'price_alert', title: 'Price drop: Huile de table',
    message: 'Huile de table at Marjane dropped to MAD 25.9/L.',
    isRead: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    actionUrl: '/grocery-prices',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Live SignalR updates
  useSignalR({
    onNotification: (raw) => {
      const notification = raw as AppNotification;
      setNotifications((prev) => [notification, ...prev]);
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div>
      <AppPageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={markAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-500 text-white text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description="You're all caught up! New activity will appear here."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-slate-50">
            {filtered.map((notif) => {
              const Icon = kindIcon[notif.kind];
              return (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer',
                    notif.isRead ? 'hover:bg-slate-50' : 'bg-primary-50/40 hover:bg-primary-50/60'
                  )}
                  onClick={() => markRead(notif.id)}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', kindColor[notif.kind])}>
                    <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', notif.isRead ? 'font-normal text-slate-700' : 'font-semibold text-slate-800')}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatRelativeDate(notif.createdAt)}</p>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors flex-shrink-0 mt-0.5"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
