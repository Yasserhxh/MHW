import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { normalizeApiError } from '@/shared/utils/error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="Forgot password" subtitle="We will simulate a reset email and let you continue with the mock token flow.">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            setSuccess('');
            try {
              await authApi.forgotPassword({ email });
              setSuccess('Reset instructions sent. Use token "mock-reset-token" on the next screen.');
            } catch (err) {
              setError(normalizeApiError(err).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
          <Button type="submit" className="w-full" loading={loading}>Send reset instructions</Button>
        </form>
        <div className="mt-6 text-sm text-slate-500">
          Remembered your password? <Link to="/login" className="text-teal-700">Back to login</Link>
        </div>
      </AuthCard>
    </div>
  );
}
