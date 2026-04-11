import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { StatusBadge } from '../../../shared/components/common';
import { useNotificationsStore } from '../hooks/notifications.store';

export default function NotificationsPage() {
  const { items, markRead, markAllRead } = useNotificationsStore();
  const unread = items.filter((i) => !i.read);
  const read = items.filter((i) => i.read);

  return (
    <div className="page-grid">
      <AppPageHeader title="Notifications" subtitle="Unread and read system updates." action={<button className="btn btn-ghost" onClick={markAllRead}>Mark all as read</button>} />
      <section className="card">
        <h3>Unread</h3>
        <div className="list">
          {unread.map((item) => <div key={item.id} className="list-item"><span>{item.title}</span><span><StatusBadge status="unread" /> <button className="btn btn-ghost" onClick={() => markRead(item.id)}>Read</button></span></div>)}
        </div>
      </section>
      <section className="card">
        <h3>Read</h3>
        <div className="list">
          {read.map((item) => <div key={item.id} className="list-item"><span>{item.title}</span><StatusBadge status="read" /></div>)}
        </div>
      </section>
    </div>
  );
}
