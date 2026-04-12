import { useParams } from 'react-router-dom';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { useReminder } from '../hooks/useReminders';

export default function ReminderDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useReminder(id);
  if (isLoading) return <LoadingState message="Loading reminder..." />;
  if (isError || !data) return <ErrorState message="Reminder not found." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title={data.title} subtitle="Reminder detail" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Schedule">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Due date: {data.dueDate}</div>
            <div>Recurrence: {data.recurrence}</div>
            <div>Status: {data.status}</div>
          </div>
        </SectionCard>
        <SectionCard title="Details">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Category: {data.category}</div>
            <div>Priority: {data.priority}</div>
            <div>Email notifications: {data.notifyByEmail ? 'On' : 'Off'}</div>
            {data.notes ? <div>Notes: {data.notes}</div> : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
