import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <AppPageHeader title="Security" subtitle="Manage password changes and future account protection options." />
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Change password">
          <form className="space-y-4">
            <Input label="Current password" type="password" />
            <Input label="New password" type="password" />
            <Input label="Confirm new password" type="password" />
            <Button type="button">Update password</Button>
          </form>
        </SectionCard>
        <SectionCard title="Future protection">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-4">Device sessions will appear here when backend session tracking is enabled.</div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4">Multi-factor authentication can be added later without restructuring this page.</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
