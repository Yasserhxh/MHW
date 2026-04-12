import { Navigate } from 'react-router-dom';

export default function NewReminderPage() {
  return <Navigate to="/reminders" replace state={{ openCreate: true }} />;
}
