import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from './AuthPage';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock context hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    googleLogin: vi.fn(),
    requestRegistrationOtp: vi.fn(),
    verifyRegistration: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

describe('AuthPage component tests', () => {
  it('renders sign-in page elements successfully', () => {
    render(
      <GoogleOAuthProvider clientId="dummy-id">
        <BrowserRouter>
          <AuthPage />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    // Verify presence of brand header
    expect(screen.getByText('TrekMate Danang')).toBeInTheDocument();
    
    // Verify presence of tagline
    expect(screen.getByText('Explore Central Vietnam with confidence')).toBeInTheDocument();

    // Verify presence of form inputs labels
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
  });
});
