import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    bg: 'bg-emerald-900/90 border-emerald-500/50 text-white',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-rose-900/90 border-rose-500/50 text-white',
    iconBg: 'bg-rose-500/20 text-rose-400',
    Icon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-900/90 border-amber-500/50 text-white',
    iconBg: 'bg-amber-500/20 text-amber-400',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-teal-900/90 border-teal-500/50 text-white',
    iconBg: 'bg-teal-500/20 text-teal-400',
    Icon: Info,
  },
};

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;
        const IconComponent = style.Icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 transform translate-y-0 animate-in slide-in-from-top-4 fade-in ${style.bg}`}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${style.iconBg}`}>
              <IconComponent size={20} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && (
                <h4 className="text-sm font-semibold tracking-wide mb-0.5 text-white">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs sm:text-sm text-gray-200 leading-snug break-words">
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(toast.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
