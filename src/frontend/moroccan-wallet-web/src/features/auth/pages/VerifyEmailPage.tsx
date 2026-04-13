import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { Button } from '@/shared/components/ui/Button';
import { normalizeApiError } from '@/shared/utils/error';
import { useAuthStore } from '../store/auth.store';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [token] = useState(params.get('token') ?? '');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const setProfile = useAuthStore((s) => s.setProfile);

  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="Verify email" subtitle="Activate your account so the full household wallet is ready to use.">
        <div className="space-y-4">
          {token ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Verification token detected and ready to submit.
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No verification token was found in the URL. Paste the email link token into the address bar as `?token=...`.
            </div>
          )}
          {status !== 'idle' ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {message}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button
              onClick={async () => {
                try {
                  await authApi.verifyEmail({ token });
                  setProfile({ emailVerified: true });
                  setStatus('success');
                  setMessage('Email verified successfully.');
                } catch (err) {
                  setStatus('error');
                  setMessage(normalizeApiError(err).message);
                }
              }}
            >
              Verify now
            </Button>
            <Button variant="outline" onClick={() => { setStatus('success'); setMessage('Resend verification is not wired yet. Request a fresh verification token from the backend workflow.'); }}>
              Resend email
            </Button>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
