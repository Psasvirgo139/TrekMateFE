import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      Icon: AlertTriangle,
      iconBg: 'bg-rose-100 text-rose-600 border border-rose-200',
      btnClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    },
    warning: {
      Icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-600 border border-amber-200',
      btnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
    },
    info: {
      Icon: Info,
      iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      btnClass: 'bg-[#012d1d] hover:bg-emerald-800 text-white shadow-emerald-200',
    },
  };

  const currentConfig = iconConfig[type] || iconConfig.danger;
  const IconComponent = currentConfig.Icon;

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className={`p-3 rounded-2xl flex-shrink-0 ${currentConfig.iconBg}`}>
            <IconComponent size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all ${currentConfig.btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
