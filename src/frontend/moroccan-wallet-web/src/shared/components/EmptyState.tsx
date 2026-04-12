import type { LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
