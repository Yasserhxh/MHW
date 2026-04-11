import { AppPageHeader } from '../../../shared/components/AppPageHeader';
import { ReminderList } from '../../../shared/components/ReminderList';
import { SectionCard } from '../../../shared/components/SectionCard';

export default function RemindersPage() {
  return (
    <div className="page-grid">
      <AppPageHeader title="Reminders" subtitle="Agenda style reminders for bills and recurring payments." />
      <div className="grid-2">
        <SectionCard title="Upcoming"><ReminderList items={[{ id: '1', title: 'Water Bill', dueDate: 'Apr 14', status: 'upcoming' }]} /></SectionCard>
        <SectionCard title="Overdue"><ReminderList items={[{ id: '2', title: 'Internet Bill', dueDate: 'Apr 08', status: 'overdue' }]} /></SectionCard>
      </div>
      <SectionCard title="Create reminder">
        <form className="form-grid">
          <input className="input" placeholder="Reminder title" />
          <input className="input" type="date" />
          <button className="btn btn-primary" type="button">Save reminder</button>
        </form>
      </SectionCard>
    </div>
  );
}
