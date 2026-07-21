import React from 'react';

const ConfirmDeleteModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  tourTitle,
  showConfirm = true
}) => {
  if (!show) return null;

  const displayMessage = message || (tourTitle 
    ? `Are you sure you want to archive the tour "${tourTitle}"? It will be marked as ARCHIVED and hidden from active listings.`
    : "Are you sure you want to perform this action?");

  const displayConfirmText = confirmText || (tourTitle ? "Yes, Archive" : "Delete");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-xl shadow-2xl p-6 text-center transform transition-all duration-300">
        <div className="text-4xl mb-3 text-red-500">⚠️</div>
        <h3 className="font-montserrat font-bold text-lg text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
          {displayMessage}
        </p>
        
        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
          >
            {cancelText}
          </button>
          {showConfirm && (
            <button 
              type="button"
              onClick={onConfirm} 
              className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 shadow-sm"
            >
              {displayConfirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
