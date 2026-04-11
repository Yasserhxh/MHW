import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 flex',
              side === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom={side === 'right' ? 'translate-x-full' : '-translate-x-full'}
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo={side === 'right' ? 'translate-x-full' : '-translate-x-full'}
            >
              <Dialog.Panel
                className={cn(
                  'flex flex-col w-screen bg-white shadow-2xl',
                  widths[width]
                )}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  {title && (
                    <Dialog.Title className="text-base font-semibold text-slate-800">
                      {title}
                    </Dialog.Title>
                  )}
                  <button
                    onClick={onClose}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
