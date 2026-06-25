import React from 'react';
import { Compass, Trees } from 'lucide-react';
import FieldLabel from './FieldLabel';
import GoogleAuthButton from './GoogleAuthButton';

export default function SignupForm({
  form,
  onChange,
  onSubmit,
  onGoogleSuccess,
  onGoogleError,
  submitting
}) {
  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <h2 className="text-2xl font-bold text-brand-dark mb-1.5 font-montserrat">Create your account</h2>
      <p className="text-sm text-slate-500 mb-5">Choose how you want to use TrekMate.</p>

      <p className="text-[13px] font-bold text-brand-dark mb-3">Choose Your Identity</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          className={`border rounded-2xl p-3.5 text-left cursor-pointer flex flex-col gap-1.5 transition-all ${
            form.role === 'CUSTOMER'
              ? 'border-brand-dark border-2 bg-brand-dark/5'
              : 'border-brand-dark/15 bg-white hover:border-brand-dark/30'
          }`}
          onClick={() => onChange({ ...form, role: 'CUSTOMER' })}
        >
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-brand-dark/12 bg-brand-dark/4 text-brand-dark ${
            form.role === 'CUSTOMER' ? 'border-brand-dark bg-brand-dark/8' : ''
          }`}>
            <Compass size={22} strokeWidth={2.2} />
          </span>
          <strong className="text-brand-dark text-[13.5px]">Experience Seeker</strong>
          <span className="text-[11px] text-slate-500 leading-normal">Explore the wild with vetted guides.</span>
        </button>

        <button
          type="button"
          className={`border rounded-2xl p-3.5 text-left cursor-pointer flex flex-col gap-1.5 transition-all ${
            form.role === 'GUIDE'
              ? 'border-brand-dark border-2 bg-brand-dark/5'
              : 'border-brand-dark/15 bg-white hover:border-brand-dark/30'
          }`}
          onClick={() => onChange({ ...form, role: 'GUIDE' })}
        >
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-brand-dark/12 bg-brand-dark/4 text-brand-dark ${
            form.role === 'GUIDE' ? 'border-brand-dark bg-brand-dark/8' : ''
          }`}>
            <Trees size={22} strokeWidth={2.2} />
          </span>
          <strong className="text-brand-dark text-[13px]">Guide</strong>
          <span className="text-[11px] text-slate-500 leading-normal">Lead expeditions and manage logistics.</span>
        </button>
      </div>

      <label className="flex flex-col gap-1.5 mb-4 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Full name</FieldLabel>
        <input
          type="text"
          required
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.displayName}
          onChange={(e) => onChange({ ...form, displayName: e.target.value })}
        />
      </label>

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
        <FieldLabel>Phone</FieldLabel>
        <input
          type="tel"
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1.5 mb-2 text-sm font-semibold text-brand-dark">
        <FieldLabel required>Password</FieldLabel>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="border border-brand-dark/15 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/35 focus:border-orange-500 transition-all"
          value={form.password}
          onChange={(e) => onChange({ ...form, password: e.target.value })}
        />
      </label>
      <p className="text-xs text-slate-400 mb-4 ml-1">At least 8 characters.</p>

      <div className="flex items-center gap-3 w-full mt-6 mb-3">
        <button
          type="submit"
          className="flex-1 h-10 flex items-center justify-center rounded-full px-4 font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          {submitting ? 'Sending...' : 'Continue'}
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
