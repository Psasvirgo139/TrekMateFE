import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    const returnUrl = `${location.pathname}${location.search}`;
    if (!returnUrl.startsWith('/auth')) {
      sessionStorage.setItem('returnUrl', returnUrl);
    }
    return <Navigate to="/auth?tab=login" replace />;
  }

  if (roles?.length && !roles.some((role) => user.roles?.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
