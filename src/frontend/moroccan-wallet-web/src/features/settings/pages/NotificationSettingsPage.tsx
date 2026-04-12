import { useEffect } from 'react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { usePreferenceSettings, useSaveSettings } from '../hooks/useSettings';

export default function NotificationSettingsPage() {
  const { data, isLoading, isError, refetch } = usePreferenceSettings();
  const saveSettings = useSaveSettings('notifications');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (data) reset(data.notifications);
  }, [data, reset]);

  if (isLoading) return <LoadingState message="Loading notification preferences..." />;
  if (isError || !data) return <ErrorState message="Could not load notification preferences." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Notification settings" subtitle="Choose how updates should reach you." />
      <SectionCard title="Delivery preferences">
        <form className="space-y-4" onSubmit={handleSubmit(async (values) => { await saveSettings.mutateAsync(values); })}>
          {[
            ['reminderInApp', 'In-app reminders'],
            ['reminderEmail', 'Email reminders'],
            ['sharedExpenseInApp', 'Shared expense alerts'],
            ['budgetWarningInApp', 'Budget warnings'],
            ['weeklyDigestEmail', 'Weekly email digest'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <span>{label}</span>
              <input type="checkbox" {...register(field)} />
            </label>
          ))}
          <Button type="submit" loading={saveSettings.isPending}>Save preferences</Button>
        </form>
      </SectionCard>
    </div>
  );
}
