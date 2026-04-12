import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { normalizeApiError } from '@/shared/utils/error';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="Create your account" subtitle="Set up Moroccan Household Wallet and start with a realistic onboarding flow.">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (password !== confirmPassword) return setError('Passwords do not match.');
            if (!acceptTerms) return setError('You must accept the terms to continue.');
            setLoading(true);
            setError('');
            try {
              await authApi.register({ fullName, email, password, confirmPassword, acceptTerms });
              navigate('/auth/success');
            } catch (err) {
              setError(normalizeApiError(err).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Input label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
            I agree to the household wallet terms
          </label>
          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <Button type="submit" className="w-full" loading={loading}>Create account</Button>
        </form>
        <div className="mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-teal-700">Sign in</Link>
        </div>
      </AuthCard>
    </div>
  );
}
