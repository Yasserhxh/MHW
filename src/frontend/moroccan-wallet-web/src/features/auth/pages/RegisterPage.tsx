import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AuthCard } from '../components/AuthCard';
import { authApi } from '../api/auth.api';
import { useAuthSubmit } from '../hooks/useAuthSubmit';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, success, run } = useAuthSubmit(authApi.register);

  return (
    <AuthCard title="Create your account" subtitle="Start tracking spending and shared costs.">
      <form className="form-grid" onSubmit={(e) => {
        e.preventDefault();
        run({ firstName, lastName, email, password }, 'Account created. Check your email to verify your account.');
      }}>
        <input className="input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input className="input" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <span style={{ color: 'var(--danger)' }}>{error}</span> : null}
        {success ? <span style={{ color: 'var(--success)' }}>{success}</span> : null}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
      </form>
      <p>Already registered? <Link to="/login">Sign in</Link></p>
    </AuthCard>
  );
}
