import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/Button';
import { useNotificationActions, useNotifications } from '../hooks/useNotifications';

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const actions = useNotificationActions();

  if (isLoading) return <LoadingState message="Loading notifications..." />;
  if (isError || !data) return <ErrorState message="Could not load notifications." onRetry={() => void refetch()} />;

  const unread = data.filter((item) => !item.isRead);
  const read = data.filter((item) => item.isRead);
  const sections: Array<[string, typeof unread]> = [['Unread', unread], ['Read', read]];

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Notifications"
        subtitle="Unread alerts, household activity, and system updates all in one place."
        action={<div className="flex gap-2"><Button variant="outline" onClick={() => actions.emitMock.mutate()}>Simulate live event</Button><Button variant="ghost" onClick={() => actions.markAllRead.mutate()}>Mark all read</Button></div>}
      />
      {sections.map(([label, items]) => (
        <section key={label} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">{label}</h3>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.message}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.kind}</div>
                </div>
                <div className="text-right">
                  <StatusBadge status={item.isRead ? 'read' : 'unread'} />
                  {!item.isRead ? <div className="mt-2"><Button size="sm" variant="ghost" onClick={() => actions.markRead.mutate(item.id)}>Mark read</Button></div> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
