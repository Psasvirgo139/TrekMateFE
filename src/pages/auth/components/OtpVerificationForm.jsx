import React from 'react';
import FieldLabel from './FieldLabel';

export default function OtpVerificationForm({
  email,
  otpValue,
  onChangeOtp,
  onSubmit,
  onResendOtp,
  onBackToSignup,
  submitting
}) {
  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold text-brand-dark mb-1.5 font-montserrat">Verify your email</h2>
      <p className="text-sm text-slate-500 mb-5">
        Enter the 6-digit code sent to <strong className="text-brand-dark">{email}</strong>.
      </p>

      <label className="flex flex-col gap-1.5 mb-5 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Verification code</FieldLabel>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          value={otpValue}
          onChange={(e) => onChangeOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-xl font-bold tracking-[0.35em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
        />
      </label>

      <button
        type="submit"
        className="w-full h-10 flex items-center justify-center rounded-full px-4 font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-3"
        disabled={submitting || otpValue.length !== 6}
      >
        {submitting ? 'Verifying...' : 'Verify & Create Account'}
      </button>

      <button
        type="button"
        className="w-full h-10 border border-brand-dark/15 text-brand-dark bg-white hover:bg-slate-50 rounded-full font-semibold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-4"
        onClick={onResendOtp}
        disabled={submitting}
      >
        Resend code
      </button>

      <button
        type="button"
        className="w-full text-center text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline bg-transparent border-none py-1 cursor-pointer"
        onClick={onBackToSignup}
      >
        Back to registration
      </button>
    </form>
  );
}
