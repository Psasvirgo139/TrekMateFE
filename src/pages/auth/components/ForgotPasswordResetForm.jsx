import React from 'react';
import FieldLabel from './FieldLabel';

export default function ForgotPasswordResetForm({
  email,
  form,
  onChange,
  onSubmit,
  onResendOtp,
  submitting
}) {
  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold text-brand-dark mb-1.5 font-montserrat">Enter reset code</h2>
      <p className="text-sm text-slate-500 mb-5">
        Check your inbox for <strong className="text-brand-dark">{email}</strong>.
      </p>

      <label className="flex flex-col gap-1.5 mb-4 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Verification code</FieldLabel>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-xl font-bold tracking-[0.35em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.otp}
          onChange={(e) => onChange({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
        />
      </label>

      <label className="flex flex-col gap-1.5 mb-5 text-sm font-semibold text-brand-dark">
        <FieldLabel required>New password</FieldLabel>
        <input
          type="password"
          required
          minLength={8}
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.newPassword}
          onChange={(e) => onChange({ ...form, newPassword: e.target.value })}
        />
      </label>

      <button
        type="submit"
        className="w-full h-10 flex items-center justify-center rounded-full px-4 font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        disabled={submitting || form.otp.length !== 6}
      >
        {submitting ? 'Updating...' : 'Update password'}
      </button>

      <button
        type="button"
        className="w-full text-center text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline bg-transparent border-none py-1 cursor-pointer"
        onClick={onResendOtp}
      >
        Resend code
      </button>
    </form>
  );
}
