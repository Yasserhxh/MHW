import { CircleCheckBig } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';

export default function AuthSuccessPage() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <AuthCard title="All set" subtitle="Your action completed successfully. You can continue to the app now.">
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CircleCheckBig className="h-8 w-8" />
          </div>
          <Link className="inline-flex rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white" to="/login">
            Return to login
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
