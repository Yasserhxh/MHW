import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { useAuthSubmit } from '../hooks/useAuthSubmit';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { loading, error, success, run } = useAuthSubmit(authApi.resetPassword);

  return (
    <AuthCard title="Reset password" subtitle="Enter your reset token and new password.">
      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        run({ email, token, newPassword }, 'Password reset successful. You can sign in now.');
      }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input className="input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        {error ? <span style={{ color: 'var(--danger)' }}>{error}</span> : null}
        {success ? <span style={{ color: 'var(--success)' }}>{success}</span> : null}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</button>
      </form>
    </AuthCard>
  );
}
