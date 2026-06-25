import React from 'react';
import { Award } from 'lucide-react';

const CertificateList = ({ certifications }) => {
  if (!certifications || certifications.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl text-center py-10">
        <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-500">No certifications uploaded yet.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status?.toString().toLowerCase()) {
      case 'verified':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-4">
      <h3 className="text-lg font-bold text-trek-neutral font-montserrat flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award className="w-5 h-5 text-trek-primary" />
        Professional Certifications & Licenses
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-2xl border border-slate-100 hover:border-trek-tertiary bg-slate-50/50 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 bg-emerald-50 text-trek-primary rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide ${getStatusBadge(cert.status)}`}>
                {cert.status}
              </span>
            </div>

            <h4 className="font-extrabold text-sm text-slate-800 mt-3 font-montserrat group-hover:text-trek-primary transition-colors duration-200">
              {cert.certificationName}
            </h4>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">
              {cert.issuingOrganization}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Issued: {cert.issueDate || 'N/A'}</span>
              {cert.expiryDate && (
                <span className={new Date(cert.expiryDate) < new Date() ? 'text-red-500 font-bold' : ''}>
                  Expires: {cert.expiryDate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificateList;
