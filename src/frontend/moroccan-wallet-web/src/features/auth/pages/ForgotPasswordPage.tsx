import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { useAuthSubmit } from '../hooks/useAuthSubmit';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { loading, error, success, run } = useAuthSubmit(authApi.forgotPassword);

  return (
    <AuthCard title="Forgot password" subtitle="We will send password reset instructions.">
      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        run({ email }, 'If the email exists, reset instructions were sent.');
      }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error ? <span style={{ color: 'var(--danger)' }}>{error}</span> : null}
        {success ? <span style={{ color: 'var(--success)' }}>{success}</span> : null}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
      </form>
    </AuthCard>
  );
}
