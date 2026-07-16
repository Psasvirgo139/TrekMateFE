import React from 'react';
import { User, Mail, Phone, MapPin, Languages, Compass, CalendarDays } from 'lucide-react';

const PersonalInfoGrid = ({ data }) => {
  const fields = [
    { label: 'Date of Birth', value: data.dateOfBirth, icon: CalendarDays },
    { label: 'Gender', value: data.gender, icon: User },
    { label: 'Language', value: data.preferredLanguage, icon: Languages },
    { label: 'Nationality', value: data.nationality, icon: Compass },
    { label: 'Home Address', value: data.homeAddress, icon: MapPin, fullWidth: true },
    { label: 'Email Address', value: data.email, icon: Mail, fullWidth: true },
    { label: 'Phone Number', value: data.phone, icon: Phone },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-5">
      <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2 border-b border-slate-100 pb-3">
        <User className="w-5 h-5 text-trek-primary" />
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, idx) => {
          if (!field.value) return null;
          const Icon = field.icon;
          return (
            <div 
              key={idx} 
              className={`p-3 rounded-2xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-100/80 ${
                field.fullWidth ? 'col-span-1 md:col-span-2' : ''
              }`}
            >
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{field.label}</span>
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-trek-tertiary flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-700">{field.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalInfoGrid;
