import { Navigate } from 'react-router-dom';

export default function NewExpensePage() {
  return <Navigate to="/expenses" replace state={{ openQuickAdd: true }} />;
}
