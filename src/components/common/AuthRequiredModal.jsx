import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, X } from 'lucide-react';

export default function AuthRequiredModal({
  isOpen,
  title = 'Authentication Required',
  message = 'Please log in to your TrekMate account to use this feature!',
  onClose,
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 relative transform animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative blob */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center p-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#012d1d] flex items-center justify-center mb-4 shadow-sm">
            <Lock size={28} className="text-emerald-700" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed mb-6 px-2">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={handleLogin}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-[#012d1d] hover:bg-emerald-800 text-white text-sm font-semibold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
            >
              <LogIn size={16} />
              Log In Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
