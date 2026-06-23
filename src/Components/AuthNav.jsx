import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveReturnUrl } from '../utils/authToken';
import './AuthNav.css';

export default function AuthNav({ className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (user) {
    return (
      <div className={`auth-nav auth-nav-user ${className}`.trim()}>
        <span className="auth-nav-name">{user.displayName || user.email}</span>
        <button
          type="button"
          className="auth-nav-logout"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} strokeWidth={2.2} />
        </button>
      </div>
    );
  }

  return (
    <div className={`auth-nav ${className}`.trim()}>
      <Link to="/auth?tab=login" className="auth-nav-link" onClick={saveReturnUrl}>
        Login
      </Link>
      <Link to="/auth?tab=signup" className="auth-nav-btn primary" onClick={saveReturnUrl}>
        Sign Up
      </Link>
    </div>
  );
}