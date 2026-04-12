import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/shared/components/ui/Button';
import { Drawer } from '@/shared/components/ui/Drawer';
import { Input } from '@/shared/components/ui/Input';
import { useForm } from 'react-hook-form';
import { useReminderAction, useReminders, useSaveReminder } from '../hooks/useReminders';

export default function RemindersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReminders();
  const saveReminder = useSaveReminder();
  const completeReminder = useReminderAction('complete');
  const snoozeReminder = useReminderAction('snooze');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm({ defaultValues: { title: '', amount: 0, category: 'custom', dueDate: new Date().toISOString().slice(0, 10), recurrence: 'none', notes: '', notifyByEmail: false, priority: 'medium', status: 'upcoming' } });

  useEffect(() => {
    if ((location.state as { openCreate?: boolean } | null)?.openCreate) {
      setOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const grouped = useMemo(() => ({
    upcoming: (data ?? []).filter((item) => item.status === 'upcoming' || item.status === 'snoozed'),
    overdue: (data ?? []).filter((item) => item.status === 'overdue'),
    completed: (data ?? []).filter((item) => item.status === 'completed'),
  }), [data]);

  if (isLoading) return <LoadingState message="Loading reminders..." />;
  if (isError || !data) return <ErrorState message="Could not load reminders." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Reminders" subtitle="Stay ahead of bills, renewals, and recurring household tasks." action={<Button onClick={() => setOpen(true)}>New reminder</Button>} />
      <div className="grid gap-6 lg:grid-cols-3">
        {(['upcoming', 'overdue', 'completed'] as const).map((group) => (
          <SectionCard key={group} title={group.charAt(0).toUpperCase() + group.slice(1)}>
            <div className="space-y-3">
              {grouped[group].map((reminder) => (
                <div key={reminder.id} className="rounded-2xl border border-slate-200 p-4">
                  <Link className="text-sm font-semibold text-slate-900" to={`/reminders/${reminder.id}`}>{reminder.title}</Link>
                  <div className="mt-1 text-sm text-slate-500">{reminder.dueDate} · {reminder.recurrence}</div>
                  <div className="mt-3 flex gap-2">
                    {group !== 'completed' ? <Button size="sm" variant="outline" onClick={() => completeReminder.mutate(reminder.id)}>Mark done</Button> : null}
                    {group === 'upcoming' || group === 'overdue' ? <Button size="sm" variant="ghost" onClick={() => snoozeReminder.mutate(reminder.id)}>Snooze</Button> : null}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Create reminder" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button form="reminder-form" type="submit" loading={saveReminder.isPending}>Save</Button></>}>
        <form id="reminder-form" className="space-y-4" onSubmit={handleSubmit(async (values) => { await saveReminder.mutateAsync({ payload: values }); setOpen(false); })}>
          <Input label="Title" {...register('title')} />
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Amount (optional)" type="number" {...register('amount', { valueAsNumber: true })} /><Input label="Due date" type="date" {...register('dueDate')} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Category" {...register('category')} /><Input label="Recurrence" {...register('recurrence')} /></div>
        </form>
      </Drawer>
    </div>
  );
}
