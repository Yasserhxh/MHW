import type { ReactNode } from 'react';

export function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.8rem', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
