import { useEffect } from 'react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { usePreferenceSettings, useSaveSettings } from '../hooks/useSettings';

export default function PreferenceSettingsPage() {
  const { data, isLoading, isError, refetch } = usePreferenceSettings();
  const savePreferences = useSaveSettings('preferences');
  const { register, handleSubmit, reset } = useForm({ defaultValues: { currency: 'MAD', defaultWalletId: '', salaryDay: 28, dashboardCompactMode: false, householdDefaults: 'just-me' } });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  if (isLoading) return <LoadingState message="Loading preferences..." />;
  if (isError || !data) return <ErrorState message="Could not load preferences." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Preferences" subtitle="Set the defaults that shape your daily household finance workflow." />
      <SectionCard title="Preferences">
        <form className="space-y-4" onSubmit={handleSubmit(async (values) => { await savePreferences.mutateAsync(values); })}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Currency" {...register('currency')} />
            <Input label="Default wallet id" {...register('defaultWalletId')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Salary day" type="number" {...register('salaryDay', { valueAsNumber: true })} />
            <Input label="Household default" {...register('householdDefaults')} />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register('dashboardCompactMode')} />
            Compact dashboard mode
          </label>
          <Button type="submit" loading={savePreferences.isPending}>Save preferences</Button>
        </form>
      </SectionCard>
    </div>
  );
}
