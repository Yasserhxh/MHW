import { Navigate } from 'react-router-dom';

export default function NewSharedExpensePage() {
  return <Navigate to="/shared-expenses?compose=1" replace />;
}
