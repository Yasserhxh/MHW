import { useState } from 'react';
import { Menu as MenuIcon, Bell, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { email, accessToken, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
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
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </Link>

        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-32 truncate">
              {email}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 focus:outline-none">
              <Link
                to="/settings/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                to="/settings/preferences"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
