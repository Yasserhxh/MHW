import { useEffect, useState } from 'react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { usePreferenceSettings, useSaveSettings } from '../hooks/useSettings';
import { normalizeApiError } from '@/shared/utils/error';
import type { PreferenceSettingsValues } from '../types/settings.types';

export default function PreferenceSettingsPage() {
  const { data, isLoading, isError, refetch } = usePreferenceSettings();
  const savePreferences = useSaveSettings('preferences');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const { register, handleSubmit, reset } = useForm<PreferenceSettingsValues>({
    defaultValues: {
      locale: 'fr-MA',
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      monthlyBudgetPreference: null,
      salaryDay: null,
      householdMode: 'just-me',
      defaultWalletId: '',
      dashboardCompactMode: false,
    },
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  if (isLoading) return <LoadingState message="Loading preferences..." />;
  if (isError || !data) return <ErrorState message="Could not load preferences." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Preferences" subtitle="Set the defaults that shape your daily household finance workflow." />
      <SectionCard title="Preferences">
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setSubmitError('');
            setSubmitSuccess('');
            try {
              await savePreferences.mutateAsync(values);
              setSubmitSuccess('Preferences updated successfully.');
            } catch (error) {
              setSubmitError(normalizeApiError(error).message);
            }
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Locale</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('locale')}>
                <option value="fr-MA">Français (Maroc)</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Currency</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('currency')}>
                <option value="MAD">MAD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {submitError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</div> : null}
          {submitSuccess ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{submitSuccess}</div> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Timezone</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('timezone')}>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <Input label="Monthly budget (optional)" type="number" step="0.01" {...register('monthlyBudgetPreference', { valueAsNumber: true })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Salary day (optional)" type="number" min="1" max="31" {...register('salaryDay', { valueAsNumber: true })} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Household mode</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('householdMode')}>
                <option value="just-me">Just me</option>
                <option value="family">Family</option>
                <option value="roommates">Roommates</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500">
            Default wallet and compact dashboard mode are not backed by the current backend yet, so they are intentionally not editable here.
          </div>

          <Button type="submit" loading={savePreferences.isPending}>Save preferences</Button>
        </form>
      </SectionCard>
    </div>
  );
}
