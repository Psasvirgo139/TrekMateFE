import React from 'react';
import { HeartPulse } from 'lucide-react';

const MedicalNotesBox = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-3xl border border-red-100 shadow-lg flex flex-col md:flex-row gap-4 items-start">
      <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-md flex-shrink-0 flex items-center justify-center">
        <HeartPulse className="w-6 h-6 animate-pulse" />
      </div>
      <div>
        <h4 className="text-base font-extrabold text-red-800 font-montserrat flex items-center gap-1.5">
          Health & Medical Alerts
        </h4>
        <p className="text-sm text-red-700/95 font-semibold mt-1.5 leading-relaxed">
          {notes}
        </p>
        <span className="inline-block text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2 border border-red-200 px-2 py-0.5 rounded bg-white/70">
          Essential Safety Info
        </span>
      </div>
    </div>
  );
};

export default MedicalNotesBox;
