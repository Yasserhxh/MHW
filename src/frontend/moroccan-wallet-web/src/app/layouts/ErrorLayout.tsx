import { Link, Outlet } from 'react-router-dom';

export function ErrorLayout() {
  return (
    <div className="auth-layout">
      <div className="card auth-card">
        <Outlet />
        <p><Link to="/dashboard">Go home</Link></p>
      </div>
    </div>
  );
}
