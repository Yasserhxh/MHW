import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  useReminder,
  useSaveReminder,
  useSnoozeReminder,
} from '../hooks/useReminders';

export default function ReminderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useReminder(id);
  const { data: preferences } = usePreferenceSettings();
  const saveReminder = useSaveReminder();
  const completeReminder = useCompleteReminder();
  const snoozeReminder = useSnoozeReminder();
  const deleteReminder = useDeleteReminder();
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const currency = preferences?.currency ?? 'MAD';
  const locale = preferences?.locale ?? 'fr-MA';

  if (isLoading) return <LoadingState message="Loading reminder..." />;
  if (isError || !data) return <ErrorState message="Reminder not found." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader
        title={data.title}
        subtitle={`${getReminderCategoryLabel(data.category)} reminder · ${formatDaysUntil(data.dueDate)}`}
        action={
          <div className="flex flex-wrap gap-2">
            {data.status !== 'completed' ? (
              <Button
                variant="outline"
                loading={completeReminder.isPending}
                onClick={async () => {
                  setFeedback(null);
                  try {
                    await completeReminder.mutateAsync(data.id);
                    setFeedback({ tone: 'success', message: 'Reminder marked as complete.' });
                  } catch (error) {
                    setFeedback({ tone: 'error', message: normalizeApiError(error).message });
                  }
                }}
              >
                Mark done
              </Button>
            ) : null}
            {data.status !== 'completed' ? (
              <Button variant="ghost" onClick={() => setSnoozeOpen(true)}>
                Snooze
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => setEditorOpen(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              loading={deleteReminder.isPending}
              onClick={async () => {
                setFeedback(null);
                try {
                  await deleteReminder.mutateAsync(data.id);
                  navigate('/reminders', { replace: true });
                } catch (error) {
                  setFeedback({ tone: 'error', message: normalizeApiError(error).message });
                }
              }}
            >
              Delete
            </Button>
          </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Schedule">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Due date: {formatDate(data.dueDate)}</div>
            <div>Timing: {formatDaysUntil(data.dueDate)}</div>
            <div>Recurrence: {getReminderFrequencyLabel(data.recurrence)}</div>
            <div>Status: {data.status}</div>
            {data.snoozedUntil ? <div>Snoozed until: {formatDate(data.snoozedUntil)}</div> : null}
            {data.completedAt ? <div>Completed at: {formatDate(data.completedAt)}</div> : null}
          </div>
        </SectionCard>
        <SectionCard title="Details">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Type: {getReminderCategoryLabel(data.category)}</div>
            {typeof data.amount === 'number' ? (
              <div>Amount: {formatCurrency(data.amount, currency, locale)}</div>
            ) : null}
            <div>Created: {formatDate(data.createdAt)}</div>
            {data.notes ? <div>Notes: {data.notes}</div> : <div>No notes were added.</div>}
          </div>
        </SectionCard>
      </div>

      <ReminderFormDrawer
        open={editorOpen}
        reminder={data}
        isPending={saveReminder.isPending}
        onClose={() => setEditorOpen(false)}
        onSubmit={async (payload) => {
          try {
            await saveReminder.mutateAsync({ id: data.id, payload });
            setFeedback({ tone: 'success', message: 'Reminder updated successfully.' });
            setEditorOpen(false);
          } catch (error) {
            setFeedback({ tone: 'error', message: normalizeApiError(error).message });
            throw error;
          }
        }}
      />

      <ReminderSnoozeDrawer
        open={snoozeOpen}
        reminder={data}
        isPending={snoozeReminder.isPending}
        onClose={() => setSnoozeOpen(false)}
        onSubmit={async (until) => {
          try {
            await snoozeReminder.mutateAsync({ id: data.id, until });
            setFeedback({ tone: 'success', message: 'Reminder snoozed successfully.' });
            setSnoozeOpen(false);
          } catch (error) {
            setFeedback({ tone: 'error', message: normalizeApiError(error).message });
            throw error;
          }
        }}
      />
    </div>
  );
}
