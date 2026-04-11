import { useState } from 'react';
import { Plus, AlarmClock, CheckCircle2, Clock } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { CurrencyAmount } from '@/shared/components/CurrencyAmount';
import { formatDate, formatDaysUntil } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import type { ReminderStatus } from '../types/reminders.types';

const MOCK_REMINDERS = [
  {
    id: '1', title: 'Rent payment', description: 'Monthly apartment rent',
    dueDate: new Date(Date.now() - 86400000).toISOString(), frequency: 'monthly',
    status: 'overdue' as ReminderStatus, amount: 4500, currency: 'MAD',
  },
  {
    id: '2', title: 'Internet subscription', description: 'Maroc Telecom fiber',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), frequency: 'monthly',
    status: 'upcoming' as ReminderStatus, amount: 259, currency: 'MAD',
  },
  {
    id: '3', title: 'Water bill', description: 'RADEEJ',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), frequency: 'monthly',
    status: 'upcoming' as ReminderStatus, amount: 145, currency: 'MAD',
  },
  {
    id: '4', title: 'Car insurance renewal', description: 'Wafa Assurance',
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(), frequency: 'yearly',
    status: 'upcoming' as ReminderStatus, amount: 1800, currency: 'MAD',
  },
  {
    id: '5', title: 'Electricity bill', description: 'ONEE',
    dueDate: new Date(Date.now() - 86400000 * 10).toISOString(), frequency: 'monthly',
    status: 'completed' as ReminderStatus, amount: 180, currency: 'MAD',
  },
];

const statusVariant: Record<ReminderStatus, 'danger' | 'warning' | 'success' | 'info'> = {
  overdue: 'danger',
  today: 'warning',
  upcoming: 'info',
  completed: 'success',
};

export default function RemindersPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | ReminderStatus>('all');

  const filters: Array<'all' | ReminderStatus> = ['all', 'overdue', 'upcoming', 'completed'];

  const filtered = MOCK_REMINDERS.filter((r) =>
    activeFilter === 'all' || r.status === activeFilter
  );

  const overdue = MOCK_REMINDERS.filter((r) => r.status === 'overdue');
  const upcoming = MOCK_REMINDERS.filter((r) => r.status === 'upcoming');

  return (
    <div>
      <AppPageHeader
        title="Reminders"
        subtitle="Stay on top of bills and recurring payments"
        action={
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Add reminder
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Overdue</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-slate-800">{upcoming.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Upcoming</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-primary-600">
            MAD {MOCK_REMINDERS.filter((r) => r.status !== 'completed').reduce((s, r) => s + (r.amount ?? 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Pending total</p>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeFilter === f
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {f}
            {f === 'overdue' && overdue.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs">
                {overdue.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reminder timeline */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlarmClock}
            title="No reminders"
            description="Add reminders for bills and recurring payments."
            action={{ label: 'Add reminder', onClick: () => {} }}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((reminder) => (
            <Card key={reminder.id} padding="sm"
              className={cn(
                reminder.status === 'overdue' && 'border-red-200 bg-red-50/30',
                reminder.status === 'completed' && 'opacity-70'
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  reminder.status === 'overdue' ? 'bg-red-100' : reminder.status === 'completed' ? 'bg-green-100' : 'bg-blue-50'
                )}>
                  {reminder.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className={cn('w-5 h-5', reminder.status === 'overdue' ? 'text-red-500' : 'text-blue-500')} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-800 text-sm">{reminder.title}</span>
                    <Badge variant={statusVariant[reminder.status]} dot size="sm">
                      {formatDaysUntil(reminder.dueDate)}
                    </Badge>
                    <Badge variant="default" size="sm" className="capitalize">{reminder.frequency}</Badge>
                  </div>
                  {reminder.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{reminder.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Due {formatDate(reminder.dueDate)}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {reminder.amount && (
                    <CurrencyAmount amount={reminder.amount} currency={reminder.currency} />
                  )}
                  {reminder.status !== 'completed' && (
                    <Button size="sm" variant="outline">
                      Mark done
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
