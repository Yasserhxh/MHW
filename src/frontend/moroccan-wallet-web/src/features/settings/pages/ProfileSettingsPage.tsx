import { useEffect } from 'react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useForm } from 'react-hook-form';
import { useProfileSettings, useSaveSettings } from '../hooks/useSettings';
import { useAuthStore } from '@/features/auth/store/auth.store';

export default function ProfileSettingsPage() {
  const { data, isLoading, isError, refetch } = useProfileSettings();
  const saveProfile = useSaveSettings('profile');
  const setProfile = useAuthStore((s) => s.setProfile);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { fullName: '', email: '', language: 'fr-MA', timezone: 'Africa/Casablanca' } });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  if (isLoading) return <LoadingState message="Loading profile..." />;
  if (isError || !data) return <ErrorState message="Could not load profile." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <AppPageHeader title="Profile settings" subtitle="Update your personal account information." />
      <SectionCard title="Profile">
        <form className="space-y-4" onSubmit={handleSubmit(async (values) => { await saveProfile.mutateAsync(values); setProfile({ fullName: values.fullName }); })}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" {...register('fullName')} />
            <Input label="Email" disabled {...register('email')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Language" {...register('language')} />
            <Input label="Timezone" {...register('timezone')} />
          </div>
          <Button type="submit" loading={saveProfile.isPending}>Save profile</Button>
        </form>
      </SectionCard>
    </div>
  );
}
