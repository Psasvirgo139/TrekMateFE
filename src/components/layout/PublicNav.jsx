import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthNav from './AuthNav';
import '../../pages/Home.css';

export default function PublicNav({ activePath }) {
  const location = useLocation();
  const currentPath = activePath || location.pathname;
  const { user } = useAuth();

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link to="/" className="home-brand">
          TrekMate Danang
        </Link>

        <nav className="home-nav">
          <Link to="/" className={`home-nav-link${currentPath === '/' ? ' active' : ''}`}>
            Home
          </Link>
          <Link
            to="/locations"
            className={`home-nav-link${currentPath === '/locations' ? ' active' : ''}`}
          >
            Tours
          </Link>
          <Link
            to="/about"
            className={`home-nav-link${currentPath === '/about' ? ' active' : ''}`}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className={`home-nav-link${currentPath === '/contact' ? ' active' : ''}`}
          >
            Contact
          </Link>
          {user && (
            <Link
              to="/payment"
              className={`home-nav-link${currentPath === '/payment' ? ' active' : ''}`}
            >
              Payment
            </Link>
          )}
          {user && (
            <Link
              to="/admin/tours"
              className={`home-nav-link${currentPath.startsWith('/admin/tours') ? ' active' : ''}`}
            >
              Tour Management
            </Link>
          )}
        </nav>

        <div className="home-header-right">
          {user && (
            <Link to="/payment" className="home-button primary-button">
              Book Now
            </Link>
          )}
          <AuthNav />
        </div>
      </div>
    </header>
  );
}

