import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Sliders, Shield } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth/store/auth.store';

type SettingsTab = 'profile' | 'preferences' | 'security';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; href: string }[] = [
  { id: 'profile', label: 'Profile', icon: User, href: '/settings/profile' },
  { id: 'preferences', label: 'Preferences', icon: Sliders, href: '/settings/preferences' },
  { id: 'security', label: 'Security', icon: Shield, href: '/settings/security' },
];

export default function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);

  const activeTab: SettingsTab =
    tabs.find((t) => location.pathname.includes(t.id))?.id ?? 'profile';

  return (
    <div>
      <AppPageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                )}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileSettings email={email} />}
          {activeTab === 'preferences' && <PreferencesSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ email }: { email: string | null }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Profile information</h2>
      <div className="space-y-4 max-w-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {email?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{email}</p>
            <button className="text-xs text-primary-600 hover:text-primary-700 mt-1">
              Change avatar
            </button>
          </div>
        </div>

        <Input label="Email address" type="email" defaultValue={email ?? ''} disabled hint="Email cannot be changed" />
        <Input label="Display name" placeholder="Your full name" defaultValue="" />

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function PreferencesSettings() {
  const [currency, setCurrency] = useState('MAD');
  const [language, setLanguage] = useState('en');

  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-800 mb-5">Preferences</h2>
      <div className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Default currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="MAD">MAD — Moroccan Dirham</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Timezone</label>
          <select className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Africa/Casablanca (UTC+1)</option>
            <option>Europe/Paris (UTC+2)</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button>Save preferences</Button>
        </div>
      </div>
    </Card>
  );
}

function SecuritySettings() {
  const [showPwForm, setShowPwForm] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">Change your account password</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowPwForm(!showPwForm)}>
            {showPwForm ? 'Cancel' : 'Change'}
          </Button>
        </div>

        {showPwForm && (
          <div className="mt-4 space-y-3 max-w-sm">
            <Input label="Current password" type="password" placeholder="••••••••" />
            <Input label="New password" type="password" placeholder="••••••••" hint="Min 8 chars, one uppercase, one number" />
            <Input label="Confirm new password" type="password" placeholder="••••••••" />
            <Button size="sm">Update password</Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Active sessions</h3>
        <p className="text-xs text-slate-500 mb-4">These devices are currently logged into your account.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div>
              <p className="text-sm text-slate-700">Current device</p>
              <p className="text-xs text-slate-400 mt-0.5">Chrome on Windows · Casablanca, MA</p>
            </div>
            <span className="text-xs text-green-600 font-medium">Active now</span>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="danger" size="sm">Sign out all other sessions</Button>
        </div>
      </Card>
    </div>
  );
}
