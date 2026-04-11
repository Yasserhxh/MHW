import { AppPageHeader } from '../../../shared/components/AppPageHeader';

export default function PreferenceSettingsPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Preferences" subtitle="Language, currency, and timezone options." />
      <form className="card form-grid">
        <select className="select"><option>French</option><option>Arabic</option><option>English</option></select>
        <select className="select"><option>MAD (Moroccan Dirham)</option></select>
        <select className="select"><option>Africa/Casablanca</option></select>
        <button className="btn btn-primary" type="button">Save preferences</button>
      </form>
    </div>
  );
}
