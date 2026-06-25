import React from 'react';
import FieldLabel from './FieldLabel';

export default function ForgotPasswordRequestForm({
  email,
  onChangeEmail,
  onSubmit,
  onBackToLogin,
  submitting
}) {
  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold text-brand-dark mb-1.5 font-montserrat">Reset password</h2>
      <p className="text-sm text-slate-500 mb-5">We will email you a 6-digit reset code.</p>

      <label className="flex flex-col gap-1.5 mb-5 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Email</FieldLabel>
        <input
          type="email"
          required
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
        />
      </label>

      <button
        type="submit"
        className="w-full h-10 flex items-center justify-center rounded-full px-4 font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        disabled={submitting}
      >
        {submitting ? 'Sending...' : 'Send reset code'}
      </button>

      <button
        type="button"
        className="w-full text-center text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline bg-transparent border-none py-1 cursor-pointer"
        onClick={onBackToLogin}
      >
        Back to login
      </button>
    </form>
  );
}
