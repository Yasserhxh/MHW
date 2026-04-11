import { Button } from '@/shared/components/ui/Button';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-7xl font-black text-red-200 mb-2">500</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Server error</h1>
        <p className="text-slate-500 text-sm mb-8">Something went wrong on our end. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    </div>
  );
}
