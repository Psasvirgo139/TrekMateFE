import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Compass, Trees } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvUUzjhxn8orAI_ijOd4idjPXhRQk11CgEtlhqTDP8dTzjLQCFA0TOVxbsgHSZowz0wJX8bqs8bkqS2O-rajIZOsGXmBBgiWs8Mk3Y_cx4wAxO1xf-b9dG1PR0ZdJ6m-ja2lcrYq7ZvReev_dYJKdA9FMxT38ZHwT9SKLF4dMESGfBTXnWPzIWBxH57zvGSUx4WovbnOf5frv95va0NECUYmgTDjQP2TvucjT_9NA3M9k7M7hidjEAD10NYM56JtmZWifulkNhGFk';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function FieldLabel({ required, children }) {
  return (
    <span className="auth-label-text">
      {children}
      {required && <span className="auth-required">*</span>}
    </span>
  );
}

function resolveReturnUrl() {
  const returnUrl = sessionStorage.getItem('returnUrl') || '/';
  sessionStorage.removeItem('returnUrl');
  if (!returnUrl || returnUrl.startsWith('/auth')) {
    return '/';
  }
  return returnUrl;
}

function GoogleAuthButton({ rememberMe, onError, onSuccess, disabled }) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button" className="auth-google-disabled" disabled title="Google Client ID not configured">
        Sign in with Google
      </button>
    );
  }

  return (
    <div className={`auth-google-wrap${disabled ? ' disabled' : ''}`}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        width="100%"
        text="signin_with" 
        shape="pill"
        locale="en" /* Ép hiển thị tiếng Anh 100% */
      />
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    login,
    googleLogin,
    requestRegistrationOtp,
    verifyRegistration,
    forgotPassword,
    resetPassword,
    isAuthenticated,
  } = useAuth();

  const tabParam = searchParams.get('tab');
  const initialTab = ['signup', 'forgot'].includes(tabParam) ? tabParam : 'login';
  const [tab, setTab] = useState(initialTab);
  const [signupStep, setSignupStep] = useState('form');
  const [forgotStep, setForgotStep] = useState('request');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: false });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [forgotForm, setForgotForm] = useState({ email: '', otp: '', newPassword: '' });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolveReturnUrl(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setSearchParams({ tab }, { replace: true });
  }, [tab, setSearchParams]);

  const switchTab = (nextTab) => {
    setError('');
    setInfo('');
    setSignupStep('form');
    setForgotStep('request');
    setOtpValue('');
    setTab(nextTab);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const rememberMe = tab === 'login' ? loginForm.rememberMe : true;
      await googleLogin(credentialResponse.credential, rememberMe);
      navigate(resolveReturnUrl(), { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginForm.email.trim(), loginForm.password, loginForm.rememberMe);
      navigate(resolveReturnUrl(), { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (signupForm.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await requestRegistrationOtp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        displayName: signupForm.displayName.trim(),
        phone: signupForm.phone.trim() || null,
        role: signupForm.role,
      });
      setPendingEmail(response.email);
      setSignupStep('otp');
      setInfo(`A 6-digit code was sent to ${response.email}. It expires in ${response.expiresInMinutes} minutes.`);
    } catch (err) {
      setError(err.message || 'Could not send verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      await verifyRegistration(pendingEmail, otpValue.trim());
      navigate(resolveReturnUrl(), { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const response = await requestRegistrationOtp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        displayName: signupForm.displayName.trim(),
        phone: signupForm.phone.trim() || null,
        role: signupForm.role,
      });
      setPendingEmail(response.email);
      setInfo(`A new code was sent to ${response.email}.`);
    } catch (err) {
      setError(err.message || 'Could not resend verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotRequest = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const response = await forgotPassword(forgotForm.email.trim());
      setPendingEmail(forgotForm.email.trim().toLowerCase());
      setForgotStep('reset');
      setInfo(response.message);
    } catch (err) {
      setError(err.message || 'Could not send reset code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotReset = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    if (forgotForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await resetPassword({
        email: pendingEmail || forgotForm.email.trim(),
        otp: forgotForm.otp.trim(),
        newPassword: forgotForm.newPassword,
      });
      setInfo(response.message);
      setTimeout(() => switchTab('login'), 1500);
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <Link to="/" className="auth-hero-brand">
            TrekMate Danang
          </Link>
          <h1>Explore Central Vietnam with confidence</h1>
          <p>
            Join TrekMate to book guided treks, manage tours, and connect with experienced local
            guides across Da Nang and beyond.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          {/* Nếu đang ở tab quên mật khẩu, ẩn thanh chọn tab đi */}
          {tab !== 'forgot' && (
            <div className="auth-tabs">
              <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => switchTab('login')}>
                Login
              </button>
              <button type="button" className={tab === 'signup' ? 'active' : ''} onClick={() => switchTab('signup')}>
                Sign Up
              </button>
            </div>
          )}

          {/* Nếu đang ở form quên mật khẩu, hiển thị một tiêu đề giả dạng tab để giữ bố cục */}
          {tab === 'forgot' && (
            <div className="auth-tabs" style={{ gridTemplateColumns: '1fr' }}>
              <button type="button" className="active" style={{ cursor: 'default' }}>
                Forgot Password
              </button>
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <h2>Welcome back</h2>
              <p className="auth-subtitle">Sign in to continue your adventure.</p>

              <label>
                <FieldLabel required>Email</FieldLabel>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </label>

              <label>
                <FieldLabel required>Password</FieldLabel>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </label>

              <div className="auth-row">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                  />
                  Remember me
                </label>
                <button type="button" className="auth-link-btn" onClick={() => switchTab('forgot')}>
                  Forgot password?
                </button>
              </div>

              {/* KHỐI NÚT ĐƯỢC ĐẶT NGANG HÀNG NHAU */}
              <div className="auth-action-row">
                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>

                <GoogleAuthButton
                  rememberMe={loginForm.rememberMe}
                  disabled={submitting}
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed.')}
                />
              </div>
            </form>
          )}

          {tab === 'signup' && signupStep === 'form' && (
            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <h2>Create your account</h2>
              <p className="auth-subtitle">Choose how you want to use TrekMate.</p>

              <p className="auth-section-title">Choose Your Identity</p>
              <div className="auth-role-cards">
                <button
                  type="button"
                  className={`auth-role-card${signupForm.role === 'CUSTOMER' ? ' selected' : ''}`}
                  onClick={() => setSignupForm({ ...signupForm, role: 'CUSTOMER' })}
                >
                  <span className="auth-role-icon">
                    <Compass size={22} strokeWidth={2.2} />
                  </span>
                  <strong>Experience Seeker</strong>
                  <span>Explore the wild with vetted guides.</span>
                </button>
                <button
                  type="button"
                  className={`auth-role-card${signupForm.role === 'GUIDE' ? ' selected' : ''}`}
                  onClick={() => setSignupForm({ ...signupForm, role: 'GUIDE' })}
                >
                  <span className="auth-role-icon">
                    <Trees size={22} strokeWidth={2.2} />
                  </span>
                  <strong>Guide</strong>
                  <span>Lead expeditions and manage logistics.</span>
                </button>
              </div>

              <label>
                <FieldLabel required>Full name</FieldLabel>
                <input
                  type="text"
                  required
                  value={signupForm.displayName}
                  onChange={(e) => setSignupForm({ ...signupForm, displayName: e.target.value })}
                />
              </label>

              <label>
                <FieldLabel required>Email</FieldLabel>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                />
              </label>

              <label>
                <FieldLabel>Phone</FieldLabel>
                <input
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                />
              </label>

              <label>
                <FieldLabel required>Password</FieldLabel>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                />
              </label>
              <p className="auth-hint">At least 8 characters.</p>

              {/* KHỐI NÚT ĐƯỢC ĐẶT NGANG HÀNG NHAU */}
              <div className="auth-action-row">
                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Continue'}
                </button>

                <GoogleAuthButton
                  rememberMe
                  disabled={submitting}
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed.')}
                />
              </div>
            </form>
          )}

          {tab === 'signup' && signupStep === 'otp' && (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <h2>Verify your email</h2>
              <p className="auth-subtitle">
                Enter the 6-digit code sent to <strong>{pendingEmail}</strong>.
              </p>

              <label>
                <FieldLabel required>Verification code</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="auth-otp-input"
                />
              </label>

              <button type="submit" className="auth-submit" disabled={submitting || otpValue.length !== 6}>
                {submitting ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button type="button" className="auth-secondary-btn" onClick={handleResendOtp} disabled={submitting}>
                Resend code
              </button>

              <button
                type="button"
                className="auth-text-btn"
                onClick={() => {
                  setSignupStep('form');
                  setOtpValue('');
                  setError('');
                  setInfo('');
                }}
              >
                Back to registration
              </button>
            </form>
          )}

          {tab === 'forgot' && forgotStep === 'request' && (
            <form className="auth-form" onSubmit={handleForgotRequest}>
              <h2>Reset password</h2>
              <p className="auth-subtitle">We will email you a 6-digit reset code.</p>

              <label>
                <FieldLabel required>Email</FieldLabel>
                <input
                  type="email"
                  required
                  value={forgotForm.email}
                  onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                />
              </label>

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send reset code'}
              </button>

              <button type="button" className="auth-text-btn" onClick={() => switchTab('login')}>
                Back to login
              </button>
            </form>
          )}

          {tab === 'forgot' && forgotStep === 'reset' && (
            <form className="auth-form" onSubmit={handleForgotReset}>
              <h2>Enter reset code</h2>
              <p className="auth-subtitle">
                Check your inbox for <strong>{pendingEmail}</strong>.
              </p>

              <label>
                <FieldLabel required>Verification code</FieldLabel>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={forgotForm.otp}
                  onChange={(e) => setForgotForm({ ...forgotForm, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="auth-otp-input"
                />
              </label>

              <label>
                <FieldLabel required>New password</FieldLabel>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={forgotForm.newPassword}
                  onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                />
              </label>

              <button type="submit" className="auth-submit" disabled={submitting || forgotForm.otp.length !== 6}>
                {submitting ? 'Updating...' : 'Update password'}
              </button>

              <button type="button" className="auth-text-btn" onClick={() => setForgotStep('request')}>
                Resend code
              </button>
            </form>
          )}

          <p className="auth-footer-note">
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </section>
    </div>
  );
}