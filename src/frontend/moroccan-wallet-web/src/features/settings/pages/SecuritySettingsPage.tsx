import { AppPageHeader } from '../../../shared/components/AppPageHeader';

export default function SecuritySettingsPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Security" subtitle="Change password and view session info." />
      <form className="card form-grid">
        <input className="input" type="password" placeholder="Current password" />
        <input className="input" type="password" placeholder="New password" />
        <button className="btn btn-primary" type="button">Update password</button>
      </form>
      <div className="card">
        <h3>Active sessions (placeholder)</h3>
        <p style={{ color: 'var(--muted)' }}>Session management endpoint will be connected when backend support is finalized.</p>
      </div>
    </div>
  );
}
