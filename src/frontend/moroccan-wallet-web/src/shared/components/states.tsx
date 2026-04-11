export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return <div className="card">{label}</div>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p style={{ color: 'var(--muted)', margin: 0 }}>{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card">
      <strong style={{ color: 'var(--danger)' }}>Something went wrong</strong>
      <p style={{ marginBottom: 0 }}>{message}</p>
    </div>
  );
}
