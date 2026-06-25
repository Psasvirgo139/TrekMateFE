import React from 'react';

const PaymentMethodOption = ({ methodId, title, description, selected, onClick }) => {
  return (
    <div
      className={`flex items-start gap-4 p-4 bg-slate-950/30 border rounded-2xl cursor-pointer hover:bg-slate-950/50 hover:border-white/15 transition-all ${
        selected
          ? "bg-sky-400/10 border-sky-400 shadow-[0_4px_20px_rgba(56,189,248,0.05)]"
          : "border-white/5"
      }`}
      onClick={onClick}
    >
      <div className={`flex justify-center items-center w-5 h-5 border-2 rounded-full mt-0.5 transition-all ${
        selected ? "border-sky-400" : "border-white/30"
      }`}>
        <div className={`w-2.5 h-2.5 bg-sky-400 rounded-full transition-transform duration-200 ${
          selected ? "scale-100" : "scale-0"
        }`} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm sm:text-base font-semibold text-slate-100">{title}</span>
        <span className="text-xs text-slate-400 leading-relaxed">{description}</span>
      </div>
    </div>
  );
};

export default PaymentMethodOption;
