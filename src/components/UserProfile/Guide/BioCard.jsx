import React from 'react';
import { Briefcase } from 'lucide-react';

const BioCard = ({ bio }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-3">
      <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2 border-b border-slate-100 pb-3">
        <Briefcase className="w-5 h-5 text-trek-primary" />
        Biography
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed font-medium">
        {bio || "This guide hasn't shared a bio yet."}
      </p>
    </div>
  );
};

export default BioCard;
