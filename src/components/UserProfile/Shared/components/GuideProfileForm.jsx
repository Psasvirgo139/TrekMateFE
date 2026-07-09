import React from 'react';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary text-sm";

export default function GuideProfileForm({ formData, onChange }) {
  const set = (key, val) => onChange({ ...formData, [key]: val });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Display Name (Required)">
          <input type="text" required value={formData.displayName || ''} onChange={(e) => set('displayName', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Phone Number">
          <input type="text" value={formData.phone || ''} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Avatar URL">
          <input type="text" value={formData.avatarUrl || ''} onChange={(e) => set('avatarUrl', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Home Province">
          <input type="text" value={formData.homeProvince || ''} onChange={(e) => set('homeProvince', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Experience Years">
          <input type="number" value={formData.experienceYears || 0} onChange={(e) => set('experienceYears', e.target.value)} className={inputCls} />
        </Field>
        <Field label="ID Card Number">
          <input type="text" value={formData.idCardNumber || ''} onChange={(e) => set('idCardNumber', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Is Available">
          <select value={formData.isAvailable ? 'true' : 'false'} onChange={(e) => set('isAvailable', e.target.value === 'true')} className={inputCls}>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </Field>
      </div>

      <Field label="Biography (Giới thiệu)">
        <textarea rows={3} value={formData.bio || ''} onChange={(e) => set('bio', e.target.value)} className={inputCls} placeholder="e.g. Certified guide with years of trekking experiences..." />
      </Field>
      <Field label="Languages (Phân tách bằng dấu phẩy)">
        <input type="text" value={formData.languages || ''} onChange={(e) => set('languages', e.target.value)} placeholder="e.g. Vietnamese, English, French" className={inputCls} />
      </Field>
      <Field label="Specializations (Phân tách bằng dấu phẩy)">
        <input type="text" value={formData.specializations || ''} onChange={(e) => set('specializations', e.target.value)} placeholder="e.g. Mountain Trekking, Jungle Survival" className={inputCls} />
      </Field>
    </>
  );
}
