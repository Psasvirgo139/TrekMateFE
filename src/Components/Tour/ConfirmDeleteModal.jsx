import React from 'react';

const ConfirmDeleteModal = ({ show, onClose, onConfirm, tourTitle }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-xl shadow-2xl p-6 text-center transform transition-all duration-300">
        <div className="text-4xl mb-3 text-amber-500">⚠️</div>
        <h3 className="font-montserrat font-bold text-xl text-gray-900 mb-2">
          Confirm Deletion
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
          Are you sure you want to archive the tour <strong className="text-gray-800">"{tourTitle}"</strong>? It will be marked as <strong className="text-gray-800">ARCHIVED</strong> and hidden from active listings.
        </p>
        
        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 shadow-sm shadow-red-500/10"
          >
            Yes, Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
