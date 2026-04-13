import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { normalizeApiError } from '@/shared/utils/error';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="Reset password" subtitle="Set a new password for your account using the reset token from email.">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (newPassword !== confirmPassword) return setError('Passwords do not match.');
            setLoading(true);
            setError('');
            setSuccess('');
            try {
              await authApi.resetPassword({ token, newPassword });
              setSuccess('Password reset successful. You can sign in now.');
            } catch (err) {
              setError(normalizeApiError(err).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Reset token" value={token} onChange={(event) => setToken(event.target.value)} />
          <Input label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          <Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
          <Button type="submit" className="w-full" loading={loading}>Reset password</Button>
        </form>
      </AuthCard>
    </div>
  );
}
