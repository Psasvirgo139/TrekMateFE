import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import subcomponents
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import OtpVerificationForm from './components/OtpVerificationForm';
import ForgotPasswordRequestForm from './components/ForgotPasswordRequestForm';
import ForgotPasswordResetForm from './components/ForgotPasswordResetForm';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvUUzjhxn8orAI_ijOd4idjPXhRQk11CgEtlhqTDP8dTzjLQCFA0TOVxbsgHSZowz0wJX8bqs8bkqS2O-rajIZOsGXmBBgiWs8Mk3Y_cx4wAxO1xf-b9dG1PR0ZdJ6m-ja2lcrYq7ZvReev_dYJKdA9FMxT38ZHwT9SKLF4dMESGfBTXnWPzIWBxH57zvGSUx4WovbnOf5frv95va0NECUYmgTDjQP2TvucjT_9NA3M9k7M7hidjEAD10NYM56JtmZWifulkNhGFk';

function resolveReturnUrl() {
  const returnUrl = sessionStorage.getItem('returnUrl') || '/';
  sessionStorage.removeItem('returnUrl');
  if (!returnUrl || returnUrl.startsWith('/auth')) {
    return '/';
  }
  return returnUrl;
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-slate-50 font-sans">
      {/* Left side Hero Panel */}
      <section
        className="relative bg-cover bg-center text-white flex items-end p-6 md:p-12 min-h-[260px] lg:min-h-screen"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#012d1d]/35 to-[#012d1d]/88" />
        <div className="relative z-10 max-w-lg">
          <Link to="/" className="inline-block mb-6 text-white font-montserrat font-bold text-lg hover:text-orange-400 transition-colors">
            TrekMate Danang
          </Link>
          <h1 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Explore Central Vietnam with confidence
          </h1>
          <p className="m-0 leading-relaxed text-slate-100/90 text-sm md:text-base">
            Join TrekMate to book guided treks, manage tours, and connect with experienced local
            guides across Da Nang and beyond.
          </p>
        </div>
      </section>

      {/* Right side Form Panel */}
      <section className="flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-[460px]">
          {/* Tabs header */}
          {tab !== 'forgot' ? (
            <div className="grid grid-cols-2 gap-2 mb-6 bg-brand-dark/5 rounded-full p-1.5">
              <button
                type="button"
                className={`border-none rounded-full py-2.5 px-4 font-bold text-sm transition-all ${
                  tab === 'login' ? 'bg-brand-dark text-white shadow-sm' : 'bg-transparent text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => switchTab('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={`border-none rounded-full py-2.5 px-4 font-bold text-sm transition-all ${
                  tab === 'signup' ? 'bg-brand-dark text-white shadow-sm' : 'bg-transparent text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => switchTab('signup')}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 mb-6 bg-brand-dark/5 rounded-full p-1.5">
              <button
                type="button"
                className="border-none rounded-full py-2.5 px-4 font-bold text-sm bg-brand-dark text-white shadow-sm cursor-default"
              >
                Forgot Password
              </button>
            </div>
          )}

          {/* Feedback alerts */}
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl p-3 mb-4 text-sm font-semibold">
              {error}
            </div>
          )}
          {info && (
            <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl p-3.5 mb-4 text-sm leading-relaxed">
              {info}
            </div>
          )}

          {/* Tab Renderings */}
          {tab === 'login' && (
            <LoginForm
              form={loginForm}
              onChange={setLoginForm}
              onSubmit={handleLoginSubmit}
              onForgotPasswordClick={() => switchTab('forgot')}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={() => setError('Google sign-in failed.')}
              submitting={submitting}
            />
          )}

          {tab === 'signup' && signupStep === 'form' && (
            <SignupForm
              form={signupForm}
              onChange={setSignupForm}
              onSubmit={handleSignupSubmit}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={() => setError('Google sign-in failed.')}
              submitting={submitting}
            />
          )}

          {tab === 'signup' && signupStep === 'otp' && (
            <OtpVerificationForm
              email={pendingEmail}
              otpValue={otpValue}
              onChangeOtp={setOtpValue}
              onSubmit={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              onBackToSignup={() => {
                setSignupStep('form');
                setOtpValue('');
                setError('');
                setInfo('');
              }}
              submitting={submitting}
            />
          )}

          {tab === 'forgot' && forgotStep === 'request' && (
            <ForgotPasswordRequestForm
              email={forgotForm.email}
              onChangeEmail={(email) => setForgotForm({ ...forgotForm, email })}
              onSubmit={handleForgotRequest}
              onBackToLogin={() => switchTab('login')}
              submitting={submitting}
            />
          )}

          {tab === 'forgot' && forgotStep === 'reset' && (
            <ForgotPasswordResetForm
              email={pendingEmail}
              form={forgotForm}
              onChange={setForgotForm}
              onSubmit={handleForgotReset}
              onResendOtp={handleForgotRequest}
              submitting={submitting}
            />
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/" className="text-brand-dark hover:text-orange-500 font-semibold underline transition-colors">
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}