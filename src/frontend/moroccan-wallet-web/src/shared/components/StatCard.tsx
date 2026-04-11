export function StatCard({ label, value, tone = 'muted' }: { label: string; value: string; tone?: 'success' | 'warning' | 'danger' | 'muted' }) {
  return (
    <div className="card">
      <div style={{ color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
      <div className="stat-number">{value}</div>
      <span className={`badge badge-${tone}`}>{tone}</span>
    </div>
  );
}
