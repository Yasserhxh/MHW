import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOnboarding, useSaveOnboarding } from '../hooks/useOnboarding';
import type { OnboardingPayload } from '../api/onboarding.api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setProfile = useAuthStore((s) => s.setProfile);
  const { data, isLoading, isError, refetch } = useOnboarding();
  const saveMutation = useSaveOnboarding();
  const { register, handleSubmit, reset } = useForm<OnboardingPayload>({
    defaultValues: {
      fullName: '',
      language: 'fr-MA',
      currency: 'MAD',
      timezone: 'Africa/Casablanca',
      householdMode: 'just-me',
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  if (isLoading) return <LoadingState message="Preparing your setup..." />;
  if (isError || !data) return <ErrorState message="We could not load onboarding." onRetry={() => void refetch()} />;

  return (
    <div className="mx-auto max-w-3xl py-10">
      <AuthCard title="Finish your setup" subtitle="A few quick details will make your dashboard more useful from day one.">
        <form
          className="space-y-5"
          onSubmit={handleSubmit(async (values) => {
            const saved = await saveMutation.mutateAsync(values);
            setProfile({ fullName: saved.fullName, onboardingCompleted: true });
            navigate('/dashboard');
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" {...register('fullName')} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Language</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('language')}>
                <option value="fr-MA">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Currency</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('currency')}>
                <option value="MAD">MAD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Timezone</label>
              <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('timezone')}>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
                <option value="Europe/Paris">Europe/Paris</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Monthly budget (optional)" type="number" {...register('monthlyBudget', { valueAsNumber: true })} />
            <Input label="Salary day (optional)" type="number" min="1" max="31" {...register('salaryDay', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">How do you manage your household?</label>
            <select className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" {...register('householdMode')}>
              <option value="just-me">Just me</option>
              <option value="family">Family</option>
              <option value="roommates">Roommates</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={saveMutation.isPending}>Finish onboarding</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard')}>Skip for now</Button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
