import type { ReactNode } from 'react';

export function AppPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="topbar">
      <div>
        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h1>
        {subtitle ? <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)' }}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
