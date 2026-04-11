import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { authApi } from '../api/auth.api';

type Status = 'verifying' | 'success' | 'error' | 'no-token';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'no-token');

  useEffect(() => {
    if (!token) return;
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="text-center py-8">
        <Spinner size="lg" className="text-primary-500 mx-auto mb-4" />
        <p className="text-slate-600 text-sm">Verifying your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Email verified!</h2>
        <p className="text-slate-500 text-sm mt-2">
          Your account is now active. You can sign in.
        </p>
        <div className="mt-6">
          <Link to="/login">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Verification failed</h2>
        <p className="text-slate-500 text-sm mt-2">
          The link is invalid or has expired.
        </p>
        <div className="mt-6">
          <Link to="/register" className="text-primary-600 text-sm font-medium">
            Register again →
          </Link>
        </div>
      </div>
    );
  }

  // no-token
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Verify your email</h1>
        <p className="text-slate-500 text-sm mt-1">
          Check your inbox for a verification link we sent when you registered.
        </p>
      </div>
      <Link to="/login" className="text-primary-600 text-sm font-medium">
        Already verified? Sign in →
      </Link>
    </div>
  );
}
