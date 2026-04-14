import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePreferenceSettings } from '@/features/settings/hooks/useSettings';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/ui/Button';
import { formatCurrency, formatDate, formatDaysUntil } from '@/shared/utils/format';
import { normalizeApiError } from '@/shared/utils/error';
import { ReminderFormDrawer } from '../components/ReminderFormDrawer';
import { ReminderSnoozeDrawer } from '../components/ReminderSnoozeDrawer';
import { getReminderCategoryLabel, getReminderFrequencyLabel } from '../lib/reminder';
import {
  useCompleteReminder,
  useDeleteReminder,
  useReminders,
  useSaveReminder,
  useSnoozeReminder,
} from '../hooks/useReminders';
import type { Reminder } from '../types/reminders.types';

type FeedbackState = { tone: 'success' | 'error'; message: string } | null;

export default function RemindersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReminders();
  const { data: preferences } = usePreferenceSettings();
  const saveReminder = useSaveReminder();
  const completeReminder = useCompleteReminder();
  const snoozeReminder = useSnoozeReminder();
  const deleteReminder = useDeleteReminder();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const currency = preferences?.currency ?? 'MAD';
  const locale = preferences?.locale ?? 'fr-MA';

  useEffect(() => {
    if ((location.state as { openCreate?: boolean } | null)?.openCreate) {
      setSelectedReminder(null);
      setEditorOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const grouped = useMemo(
    () => ({
      upcoming: (data ?? []).filter((item) => item.status === 'upcoming' || item.status === 'today'),
      overdue: (data ?? []).filter((item) => item.status === 'overdue'),
      snoozed: (data ?? []).filter((item) => item.status === 'snoozed'),
      completed: (data ?? []).filter((item) => item.status === 'completed'),
    }),
    [data]
  );

  if (isLoading) return <LoadingState message="Loading reminders..." />;
  if (isError || !data) return <ErrorState message="Could not load reminders." onRetry={() => void refetch()} />;

  const formatMoney = (amount?: number) =>
    typeof amount === 'number' ? formatCurrency(amount, currency, locale) : null;

  const sections: Array<{ key: keyof typeof grouped; title: string; empty: string }> = [
    { key: 'upcoming', title: 'Upcoming', empty: 'No upcoming reminders right now.' },
    { key: 'overdue', title: 'Overdue', empty: 'Nothing is overdue.' },
    { key: 'snoozed', title: 'Snoozed', empty: 'No reminders are snoozed.' },
    { key: 'completed', title: 'Completed', empty: 'Completed reminders will appear here.' },
  ];

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Reminders"
        subtitle="Stay ahead of bills, renewals, and recurring household tasks."
        action={
          <Button
            onClick={() => {
              setFeedback(null);
              setSelectedReminder(null);
              setEditorOpen(true);
            }}
          >
            New reminder
          </Button>
        }
      />

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <SectionCard key={section.key} title={`${section.title} (${grouped[section.key].length})`}>
            <div className="space-y-3">
              {grouped[section.key].length ? (
                grouped[section.key].map((reminder) => (
                  <div key={reminder.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link className="text-sm font-semibold text-slate-900 hover:text-teal-700" to={`/reminders/${reminder.id}`}>
                          {reminder.title}
                        </Link>
                        <div className="mt-1 text-sm text-slate-500">
                          {formatDate(reminder.dueDate)} · {getReminderFrequencyLabel(reminder.recurrence)} ·{' '}
                          {getReminderCategoryLabel(reminder.category)}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">{formatDaysUntil(reminder.dueDate)}</div>
                        {reminder.notes ? <div className="mt-2 text-sm text-slate-600">{reminder.notes}</div> : null}
                      </div>
                      <div className="text-right">
                        {formatMoney(reminder.amount) ? (
                          <div className="text-sm font-semibold text-slate-900">{formatMoney(reminder.amount)}</div>
                        ) : null}
                        <div
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            reminder.status === 'overdue'
                              ? 'bg-rose-100 text-rose-700'
                              : reminder.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : reminder.status === 'snoozed'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          {reminder.status}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {reminder.status !== 'completed' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={completeReminder.isPending}
                          onClick={async () => {
                            setFeedback(null);
                            try {
                              await completeReminder.mutateAsync(reminder.id);
                              setFeedback({ tone: 'success', message: `"${reminder.title}" marked as complete.` });
                            } catch (error) {
                              setFeedback({ tone: 'error', message: normalizeApiError(error).message });
                            }
                          }}
                        >
                          Mark done
                        </Button>
                      ) : null}
                      {reminder.status !== 'completed' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFeedback(null);
                            setSelectedReminder(reminder);
                            setSnoozeOpen(true);
                          }}
                        >
                          Snooze
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setFeedback(null);
                          setSelectedReminder(reminder);
                          setEditorOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={deleteReminder.isPending}
                        onClick={async () => {
                          setFeedback(null);
                          try {
                            await deleteReminder.mutateAsync(reminder.id);
                            setFeedback({ tone: 'success', message: `"${reminder.title}" was deleted.` });
                          } catch (error) {
                            setFeedback({ tone: 'error', message: normalizeApiError(error).message });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                  {section.empty}
                </div>
              )}
            </div>
          </SectionCard>
        ))}
      </div>

      <ReminderFormDrawer
        open={editorOpen}
        reminder={selectedReminder}
        isPending={saveReminder.isPending}
        onClose={() => {
          setEditorOpen(false);
          setSelectedReminder(null);
        }}
        onSubmit={async (payload) => {
          try {
            await saveReminder.mutateAsync({ id: selectedReminder?.id, payload });
            setFeedback({
              tone: 'success',
              message: selectedReminder ? 'Reminder updated successfully.' : 'Reminder created successfully.',
            });
            setEditorOpen(false);
            setSelectedReminder(null);
          } catch (error) {
            setFeedback({ tone: 'error', message: normalizeApiError(error).message });
            throw error;
          }
        }}
      />

      <ReminderSnoozeDrawer
        open={snoozeOpen}
        reminder={selectedReminder}
        isPending={snoozeReminder.isPending}
        onClose={() => {
          setSnoozeOpen(false);
          setSelectedReminder(null);
        }}
        onSubmit={async (until) => {
          if (!selectedReminder) return;

          try {
            await snoozeReminder.mutateAsync({ id: selectedReminder.id, until });
            setFeedback({ tone: 'success', message: `"${selectedReminder.title}" was snoozed.` });
            setSnoozeOpen(false);
            setSelectedReminder(null);
          } catch (error) {
            setFeedback({ tone: 'error', message: normalizeApiError(error).message });
            throw error;
          }
        }}
      />
    </div>
  );
}
