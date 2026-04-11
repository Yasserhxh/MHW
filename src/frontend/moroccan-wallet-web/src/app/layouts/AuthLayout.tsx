import { Outlet } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-400 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary-600 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Moroccan Wallet</span>
          </div>
        </div>

        <div className="relative space-y-4">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Manage your household finances with clarity.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Track daily expenses, split shared costs, monitor grocery prices, and stay on top of reminders — all in one place.
          </p>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex -space-x-2">
            {['HA', 'FZ', 'MA'].map((initials) => (
              <div
                key={initials}
                className="w-8 h-8 rounded-full bg-primary-600 border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            Trusted by households across Morocco
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white lg:bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-slate-800 font-bold text-base">Moroccan Wallet</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
