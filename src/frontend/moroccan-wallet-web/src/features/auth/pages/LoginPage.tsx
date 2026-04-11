import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { AuthCard } from '../components/AuthCard';
import { validators } from '../schemas/auth.validation';
import { normalizeApiError } from '../../../shared/utils/error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validators.email(email) || validators.password(password);
    if (validation) return setError(validation);

    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login({ email, password });
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, userId: data.userId, email: data.email });
      navigate('/dashboard');
    } catch (e) {
      setError(normalizeApiError(e).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Manage your household wallet with confidence.">
      <form className="form-grid" onSubmit={handleSubmit}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <span style={{ color: 'var(--danger)' }}>{error}</span> : null}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p><Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link></p>
    </AuthCard>
  );
}
