import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { useAuthSubmit } from '../hooks/useAuthSubmit';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const { loading, error, success, run } = useAuthSubmit(authApi.verifyEmail);

  return (
    <AuthCard title="Verify email" subtitle="Confirm your email to activate your account.">
      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        run({ email, token }, 'Email successfully verified.');
      }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Verification token" value={token} onChange={(e) => setToken(e.target.value)} />
        {error ? <span style={{ color: 'var(--danger)' }}>{error}</span> : null}
        {success ? <span style={{ color: 'var(--success)' }}>{success}</span> : null}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify email'}</button>
      </form>
    </AuthCard>
  );
}
