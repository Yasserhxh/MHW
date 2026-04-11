import type { ReactNode } from 'react';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="card auth-card">
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: 'var(--muted)', marginTop: '-.2rem' }}>{subtitle}</p>
      {children}
    </div>
  );
}
