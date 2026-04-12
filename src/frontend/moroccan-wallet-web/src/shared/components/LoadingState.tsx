import { Spinner } from './ui/Spinner';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <Spinner size="lg" className="text-primary-500" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <Spinner size="md" className="text-primary-500" />
    </div>
  );
}
