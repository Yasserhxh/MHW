import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  width?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 'md' }: DrawerProps) {
  if (!open) return null;

  const titleId = title ? 'app-drawer-title' : undefined;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className={cn('absolute inset-y-0 flex', side === 'right' ? 'right-0' : 'left-0')}>
        <div className={cn('flex flex-col w-screen bg-white shadow-2xl', widths[width])}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && <h2 id={titleId} className="text-base font-semibold text-slate-800">{title}</h2>}
            <button
              onClick={onClose}
              type="button"
              aria-label="Close drawer"
              className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
