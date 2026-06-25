import React from 'react';

const PaymentStatusCard = ({ type, title, description, actions, children }) => {
  const isVerifying = type === 'verifying';
  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isCancel = type === 'cancel';

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-10 bg-[radial-gradient(circle_at_10%_20%,_rgb(18,28,36)_0%,_rgb(9,14,18)_100%)] text-slate-100 font-sans">
      <div className="w-full max-w-[550px] bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-[24px] p-6 sm:p-10 text-center shadow-2xl">
        {/* Icon Badges based on type */}
        {isVerifying && (
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-sky-400/10 rounded-full border-t-sky-400 animate-spin shadow-[0_0_15px_rgba(56,189,248,0.15)]"></div>
          </div>
        )}

        {isSuccess && (
          <div className="inline-flex justify-center items-center w-20 h-20 bg-green-500/10 text-green-500 border-2 border-green-500/30 rounded-full mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {(isError || isCancel) && (
          <div className="inline-flex justify-center items-center w-20 h-20 bg-red-500/10 text-red-500 border-2 border-red-500/30 rounded-full mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            {isError ? (
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-3 ${
          isSuccess ? 'text-green-500' : (isError || isCancel) ? 'text-red-500' : 'text-slate-100'
        }`}>
          {title}
        </h2>

        {/* Description */}
        <div className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-[400px] mx-auto">
          {description}
        </div>

        {/* Receipt Box/Custom Children */}
        {children}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusCard;
