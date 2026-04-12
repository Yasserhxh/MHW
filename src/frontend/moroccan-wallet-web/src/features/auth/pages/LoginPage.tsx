import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { normalizeApiError } from '@/shared/utils/error';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('amina@example.com');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="Welcome back" subtitle="Manage spending, reminders, and shared household money in one calm workspace.">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            try {
              const { data } = await authApi.login({ email, password });
              setAuth({ ...data });
              navigate(data.onboardingCompleted ? '/dashboard' : '/onboarding');
              void rememberMe;
            } catch (err) {
              setError(normalizeApiError(err).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            Remember me
          </label>
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <Button type="submit" className="w-full" loading={loading}>Sign in</Button>
        </form>
        <div className="mt-6 flex justify-between text-sm text-slate-500">
          <Link to="/forgot-password" className="text-teal-700">Forgot password?</Link>
          <Link to="/register" className="text-teal-700">Create account</Link>
        </div>
      </AuthCard>
    </div>
  );
}
