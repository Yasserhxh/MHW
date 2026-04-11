import { AppPageHeader } from '../../../shared/components/AppPageHeader';

export default function ProfileSettingsPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Profile settings" subtitle="Update your personal information." />
      <form className="card form-grid">
        <input className="input" placeholder="Full name" defaultValue="Amina El Idrissi" />
        <input className="input" placeholder="Email" defaultValue="amina@example.com" />
        <button className="btn btn-primary" type="button">Save profile</button>
      </form>
    </div>
  );
}
