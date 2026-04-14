import { useEffect, useState } from 'react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { useProfileSettings, useSaveSettings } from '../hooks/useSettings';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { normalizeApiError } from '@/shared/utils/error';
import type { ProfileSettingsValues } from '../types/settings.types';

export default function ProfileSettingsPage() {
  const { data, isLoading, isError, refetch } = useProfileSettings();
  const saveProfile = useSaveSettings('profile');
  const setProfile = useAuthStore((s) => s.setProfile);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const { register, handleSubmit, reset } = useForm<ProfileSettingsValues>({
    defaultValues: { fullName: '', email: '', language: 'fr-MA', timezone: 'Africa/Casablanca' },
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  if (isLoading) return <LoadingState message="Loading profile..." />;
  if (isError || !data) return <ErrorState message="Could not load profile." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Profile settings" subtitle="Update your personal account information." />
      <SectionCard title="Profile">
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setSubmitError('');
            setSubmitSuccess('');
            try {
              await saveProfile.mutateAsync(values);
              setProfile({ fullName: values.fullName });
              setSubmitSuccess('Profile updated successfully.');
            } catch (error) {
              setSubmitError(normalizeApiError(error).message);
            }
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" {...register('fullName')} />
            <Input label="Email" disabled {...register('email')} />
          </div>

          {submitError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</div> : null}
          {submitSuccess ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{submitSuccess}</div> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Language</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('language')}>
                <option value="fr-MA">Français (Maroc)</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Timezone</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('timezone')}>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>

          <Button type="submit" loading={saveProfile.isPending}>Save profile</Button>
        </form>
      </SectionCard>
    </div>
  );
}
