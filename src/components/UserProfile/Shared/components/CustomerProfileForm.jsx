import React from 'react';

// Shared field input component for brevity
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-trek-primary text-sm";

export default function CustomerProfileForm({ formData, onChange }) {
  const set = (key, val) => onChange({ ...formData, [key]: val });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name (Required)">
          <input type="text" required value={formData.fullName || ''} onChange={(e) => set('fullName', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Phone Number">
          <input type="text" value={formData.phone || ''} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Avatar URL">
          <input type="text" value={formData.avatarUrl || ''} onChange={(e) => set('avatarUrl', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Date of Birth">
          <input type="date" value={formData.dateOfBirth || ''} onChange={(e) => set('dateOfBirth', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Gender">
          <select value={formData.gender || 'Male'} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Nationality">
          <input type="text" value={formData.nationality || ''} onChange={(e) => set('nationality', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Preferred Language">
          <select value={formData.preferredLanguage || 'vi'} onChange={(e) => set('preferredLanguage', e.target.value)} className={inputCls}>
            <option value="vi">Vietnamese (vi)</option>
            <option value="en">English (en)</option>
          </select>
        </Field>
        <Field label="Fitness Level">
          <select value={formData.fitnessLevel || 'BEGINNER'} onChange={(e) => set('fitnessLevel', e.target.value)} className={inputCls}>
            <option value="BEGINNER">BEGINNER</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
            <option value="EXPERT">EXPERT</option>
          </select>
        </Field>
      </div>

      <Field label="Home Address">
        <input type="text" value={formData.homeAddress || ''} onChange={(e) => set('homeAddress', e.target.value)} className={inputCls} />
      </Field>
      <Field label="Medical Notes">
        <textarea rows={2} value={formData.medicalNotes || ''} onChange={(e) => set('medicalNotes', e.target.value)} className={inputCls} placeholder="e.g. Asthma, allergies..." />
      </Field>

      {/* Emergency Contact */}
      <div className="border-t border-slate-100 pt-4">
        <h4 className="font-extrabold text-trek-primary text-xs uppercase tracking-wider mb-3">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact Name">
            <input type="text" value={formData.emergencyContactName || ''} onChange={(e) => set('emergencyContactName', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Phone Number">
            <input type="text" value={formData.emergencyContactPhone || ''} onChange={(e) => set('emergencyContactPhone', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Relationship">
            <input type="text" value={formData.emergencyContactRelationship || ''} onChange={(e) => set('emergencyContactRelationship', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Address">
            <input type="text" value={formData.emergencyContactAddress || ''} onChange={(e) => set('emergencyContactAddress', e.target.value)} className={inputCls} />
          </Field>
        </div>
      </div>
    </>
  );
}
