import { NavLink } from 'react-router-dom';
import { Wallet, LogOut, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { mainNav, settingsNav } from '@/app/config/nav';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { email, accessToken, refreshToken, clearAuth } = useAuthStore();
  const initials = email?.slice(0, 2).toUpperCase() ?? 'U';

  const handleLogout = async () => {
    if (refreshToken && accessToken) {
      try {
        await authApi.logout(refreshToken, accessToken);
      } catch {
        // continue
      }
    }
    clearAuth();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 w-64 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Moroccan Wallet</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {mainNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary-600/15 text-primary-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="border-t border-white/8 px-3 py-3 space-y-0.5">
        <NavLink
          to={settingsNav.href}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary-600/15 text-primary-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )
          }
        >
          <settingsNav.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {settingsNav.label}
        </NavLink>

        <div className="flex items-center justify-between px-3 py-2 mt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="text-xs text-slate-400 truncate">{email}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
