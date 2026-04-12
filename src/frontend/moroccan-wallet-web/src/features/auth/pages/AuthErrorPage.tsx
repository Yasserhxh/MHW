import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export default function AuthErrorPage() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="Something went wrong" subtitle="The auth action could not be completed. Try again or return to login.">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="flex justify-center gap-3">
            <Link className="inline-flex rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700" to="/forgot-password">
              Try recovery
            </Link>
            <Link className="inline-flex rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white" to="/login">
              Back to login
            </Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
