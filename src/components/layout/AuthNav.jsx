import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, User } from 'lucide-react';
import { useAuth, useHasRole } from '../../context/AuthContext';
import { saveReturnUrl } from '../../utils/authToken';
import './AuthNav.css';

export default function AuthNav({ className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isGuide = useHasRole('GUIDE');
  const isAdmin = useHasRole('ADMIN');

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (user) {
    return (
      <div className={`auth-nav auth-nav-user ${className}`.trim()} ref={dropdownRef}>
        <button
          type="button"
          className="auth-nav-trigger"
          onClick={() => setDropdownOpen(prev => !prev)}
        >
          <span className="auth-nav-name">{user.displayName || user.email}</span>
          <span className="auth-nav-caret">▾</span>
        </button>

        {dropdownOpen && (
          <div className="auth-dropdown-menu">
            {!isAdmin && (
              <Link
                to="/profile"
                className="auth-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={15} />
                My Profile
              </Link>
            )}

            <Link
              to="/bookings"
              className="auth-dropdown-item"
              onClick={() => setDropdownOpen(false)}
            >
              <Calendar size={15} />
              Booking History
            </Link>

            {isGuide && (
              <Link
                to="/tour-leading"
                className="auth-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span aria-hidden="true" style={{ fontSize: '14px' }}>🥾</span>
                Tour Leading
              </Link>
            )}

            {/* Admin Only Link */}
            {isAdmin && (
              <Link
                to="/admin/tours"
                className="auth-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span aria-hidden="true" style={{ fontSize: '14px' }}>📋</span>
                Tour Management
              </Link>
            )}

            {/* Guide & Admin Links */}
            {(isGuide || isAdmin) && (
              <Link
                to="/admin/guide-calendar"
                className="auth-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span aria-hidden="true" style={{ fontSize: '14px' }}>📅</span>
                Guide Calendar
              </Link>
            )}

            {/* Admin Only Links */}
            {isAdmin && (
              <Link
                to="/guide/dashboard"
                className="auth-dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <span aria-hidden="true" style={{ fontSize: '14px' }}>📊</span>
                Operations Dashboard
              </Link>
            )}

            <div className="auth-dropdown-divider" style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />

            <button
              type="button"
              className="auth-dropdown-item logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
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