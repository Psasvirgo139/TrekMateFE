import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './GuideDashboard.css';

const NAV_ITEMS = [
  { to: '/guide/dashboard', label: 'Dashboard', end: false },
  { to: '/guide/equipment', label: 'Equipment', end: false },
  { to: '/guide/users', label: 'Guides', end: false },
];

const GuideDashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="gd-root">
      <aside className="gd-sidebar">
        <div className="gd-brand">
          <h1 className="gd-brand-title">TrekMate</h1>
          <p className="gd-brand-sub">Danang Operations</p>
        </div>

        <nav className="gd-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `gd-nav-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="gd-sidebar-footer">
          <NavLink to="/" className="gd-nav-link">
            Back to home
          </NavLink>
        </div>
      </aside>

      <div className="gd-main">
        <header className="gd-topbar">
          <div>
            <h1 className="gd-topbar-title">Guide Dashboard</h1>
          </div>
          {user && (
            <div className="gd-topbar-user">
              <span className="gd-topbar-name">{user.displayName || user.email}</span>
              <button
                type="button"
                className="gd-topbar-logout"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} strokeWidth={2.2} />
              </button>
            </div>
          )}
        </header>
        <main className="gd-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GuideDashboardLayout;
