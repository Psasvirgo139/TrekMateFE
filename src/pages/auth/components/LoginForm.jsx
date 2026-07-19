import React from 'react';
import FieldLabel from './FieldLabel';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginForm({
  form,
  onChange,
  onSubmit,
  onForgotPasswordClick,
  onGoogleSuccess,
  onGoogleError,
  submitting
}) {
  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold text-brand-dark mb-1.5 font-montserrat">Welcome back</h2>
      <p className="text-sm text-slate-500 mb-5">Sign in to continue your adventure.</p>

      <label className="flex flex-col gap-1.5 mb-4 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Email</FieldLabel>
        <input
          type="email"
          required
          autoComplete="email"
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1.5 mb-4 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Password</FieldLabel>
        <input
          type="password"
          required
          autoComplete="current-password"
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.password}
          onChange={(e) => onChange({ ...form, password: e.target.value })}
        />
      </label>

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <label className="flex flex-row items-center gap-2 cursor-pointer font-medium text-sm text-slate-700">
          <input
            type="checkbox"
            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
            checked={form.rememberMe}
            onChange={(e) => onChange({ ...form, rememberMe: e.target.checked })}
          />
          Remember me
        </label>
        <button
          type="button"
          className="border-none bg-none text-brand-dark text-[13px] font-semibold cursor-pointer underline p-0 hover:text-orange-500 transition-colors"
          onClick={onForgotPasswordClick}
        >
          Forgot password?
        </button>
      </div>

      <div className="flex items-center gap-3 w-full mt-6 mb-3">
        <button
          type="submit"
          className="flex-1 h-10 flex items-center justify-center rounded-full px-4 font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="flex-1">
          <GoogleAuthButton
            disabled={submitting}
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
          />
        </div>
      </div>
    </form>
  );
}
