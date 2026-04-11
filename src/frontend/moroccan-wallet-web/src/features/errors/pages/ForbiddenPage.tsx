import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-7xl font-black text-amber-200 mb-2">403</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access denied</h1>
        <p className="text-slate-500 text-sm mb-8">You don't have permission to view this page.</p>
        <Link to="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
